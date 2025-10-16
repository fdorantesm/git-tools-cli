import { Injectable } from "@nestjs/common";
import simpleGit, {
  DefaultLogFields,
  ListLogLine,
  SimpleGit,
} from "simple-git";

import { BranchNotFoundError } from "@/src/domain/git/errors/branch-not-found.error";
import { CherryPickConflictError } from "@/src/domain/git/errors/cherry-pick-conflict.error";
import {
  CherryPickOptions,
  GitRepositoryPort,
} from "@/src/domain/git/git.repository";
import { GitCommit } from "@/src/domain/git/git-commit.entity";
import { GitLogFilters, GitLogRequest } from "@/src/domain/git/git-log-request";

@Injectable()
export class SimpleGitRepository implements GitRepositoryPort {
  private readonly git: SimpleGit;

  constructor(baseDir: string = process.cwd()) {
    this.git = simpleGit({ baseDir });
  }

  async getCurrentBranch(): Promise<string> {
    const branch = await this.git.revparse(["--abbrev-ref", "HEAD"]);
    return branch.trim();
  }

  async ensureBranchExists(branch: string): Promise<void> {
    try {
      await this.git.fetch();
    } catch {
      // Ignore fetch errors for repositories without remotes.
    }

    try {
      await this.git.revparse([branch]);
    } catch (error) {
      throw new BranchNotFoundError(branch, error);
    }
  }

  async getCommitsBetween(request: GitLogRequest): Promise<GitCommit[]> {
    const logOptions = this.buildLogOptions(
      request.sourceBranch,
      request.targetBranch,
      request.filters,
    );
    const log = await this.git.log(logOptions);

    return log.all.map(commit => this.mapCommit(commit));
  }

  async cherryPick(
    commits: readonly string[],
    options: CherryPickOptions,
  ): Promise<void> {
    const args = ["cherry-pick", ...commits];

    if (options.noCommit) {
      args.splice(1, 0, "-n");
    }

    try {
      await this.git.raw(args);
    } catch (error) {
      throw new CherryPickConflictError(error);
    }
  }

  async createCommit(message: string): Promise<void> {
    await this.git.commit(message);
  }

  private buildLogOptions(
    currentBranch: string,
    targetBranch: string,
    filters?: GitLogFilters,
  ): Record<string, string | null> {
    const options: Record<string, string | null> = {
      from: currentBranch,
      to: targetBranch,
      "--no-merges": null,
    };

    if (filters?.author) {
      options["--author"] = filters.author;
    }
    if (filters?.since) {
      options["--since"] = filters.since;
    }
    if (filters?.until) {
      options["--until"] = filters.until;
    }
    if (filters?.grep) {
      options["--grep"] = filters.grep;
    }

    return options;
  }

  private mapCommit(commit: DefaultLogFields & ListLogLine): GitCommit {
    return {
      hash: commit.hash,
      message: commit.message,
      authorName: commit.author_name,
      authorEmail: commit.author_email,
      authoredDate: new Date(commit.date),
    };
  }
}
