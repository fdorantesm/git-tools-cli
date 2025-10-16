import { Inject, Injectable } from "@nestjs/common";

import { BranchNotFoundError } from "@/src/domain/git/errors/branch-not-found.error";
import { CherryPickConflictError } from "@/src/domain/git/errors/cherry-pick-conflict.error";
import { GitRepositoryPort } from "@/src/domain/git/git.repository";
import { GitCommit } from "@/src/domain/git/git-commit.entity";
import { GitLogFilters, GitLogRequest } from "@/src/domain/git/git-log-request";
import { CHERRY_PICK_PROMPTER, GIT_REPOSITORY } from "@/src/shared/tokens";

import { CherryPickOptionsDto } from "./dto/cherry-pick-options.dto";
import { CherryPickResultDto } from "./dto/cherry-pick-result.dto";
import {
  CherryPickPrompterPort,
  CherryPickPromptResult,
} from "./ports/cherry-pick-prompter.port";

@Injectable()
export class CherryPickService {
  constructor(
    @Inject(GIT_REPOSITORY)
    private readonly gitRepository: GitRepositoryPort,
    @Inject(CHERRY_PICK_PROMPTER)
    private readonly prompter: CherryPickPrompterPort,
  ) {}

  async execute(options: CherryPickOptionsDto): Promise<CherryPickResultDto> {
    const currentBranch = await this.gitRepository.getCurrentBranch();

    await this.ensureTargetBranchExists(options.from);

    const commits = await this.fetchEligibleCommits(currentBranch, options);

    if (commits.length === 0) {
      return {
        status: "no-commits",
        message: `No commits found between ${currentBranch} and ${options.from} for the provided filters.`,
      };
    }

    const promptResult = await this.prompter.prompt(commits);

    if (promptResult.selectedCommits.length === 0) {
      return {
        status: "cancelled",
        message: "No commits were selected. Nothing to apply.",
      };
    }

    await this.applyCherryPick(promptResult);

    return this.buildResultMessage(promptResult);
  }

  private async ensureTargetBranchExists(targetBranch: string): Promise<void> {
    try {
      await this.gitRepository.ensureBranchExists(targetBranch);
    } catch (error) {
      if (error instanceof BranchNotFoundError) {
        throw error;
      }
      throw new BranchNotFoundError(targetBranch, error);
    }
  }

  private async fetchEligibleCommits(
    currentBranch: string,
    options: CherryPickOptionsDto,
  ): Promise<GitCommit[]> {
    const filters: GitLogFilters = {
      author: options.author,
      since: options.since,
      until: options.until,
      grep: options.grep,
    };

    const request: GitLogRequest = {
      sourceBranch: currentBranch,
      targetBranch: options.from,
      filters,
    };

    return this.gitRepository.getCommitsBetween(request);
  }

  private async applyCherryPick(
    promptResult: CherryPickPromptResult,
  ): Promise<void> {
    const commitHashes = promptResult.selectedCommits.map(
      commit => commit.hash,
    );
    const requiresNoCommit =
      promptResult.applyMode === "no-commit" ||
      promptResult.messageStrategy === "custom";

    try {
      await this.gitRepository.cherryPick(commitHashes, {
        noCommit: requiresNoCommit,
      });
    } catch (error) {
      if (error instanceof CherryPickConflictError) {
        throw error;
      }
      throw new CherryPickConflictError(error);
    }

    if (
      promptResult.applyMode === "commit" &&
      promptResult.messageStrategy === "custom" &&
      promptResult.customMessage
    ) {
      await this.gitRepository.createCommit(promptResult.customMessage);
    }
  }

  private buildResultMessage(
    promptResult: CherryPickPromptResult,
  ): CherryPickResultDto {
    const appliedCommits = promptResult.selectedCommits.length;

    if (
      promptResult.applyMode === "commit" &&
      promptResult.messageStrategy === "custom" &&
      promptResult.customMessage
    ) {
      return {
        status: "applied",
        message:
          "Selected commits were applied and combined into a new commit.",
        appliedCommits,
      };
    }

    if (promptResult.applyMode === "commit") {
      return {
        status: "applied",
        message:
          "Selected commits were applied reusing their original messages.",
        appliedCommits,
      };
    }

    return {
      status: "applied",
      message: "Changes were applied without creating commits.",
      appliedCommits,
    };
  }
}
