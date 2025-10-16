import { Injectable } from "@nestjs/common";
import inquirer from "inquirer";

import {
  CherryPickPrompterPort,
  CherryPickPromptResult,
} from "@/src/application/cherry-pick/ports/cherry-pick-prompter.port";
import { GitCommit } from "@/src/domain/git/git-commit.entity";

function formatCommitLabel(commit: GitCommit): string {
  const date = commit.authoredDate.toISOString().split("T")[0];
  return `${commit.hash.slice(0, 7)} | ${commit.message} | ${commit.authorName} | ${date}`;
}

@Injectable()
export class InquirerCherryPickPrompter implements CherryPickPrompterPort {
  async prompt(commits: readonly GitCommit[]): Promise<CherryPickPromptResult> {
    const choices = commits.map(commit => ({
      name: formatCommitLabel(commit),
      value: commit.hash,
      short: commit.message,
    }));

    const { selectedCommits } = await inquirer.prompt<{
      selectedCommits: string[];
    }>([
      {
        type: "checkbox",
        loop: false,
        pageSize: 10,
        name: "selectedCommits",
        message: "Select the commits you want to apply",
        choices,
      },
    ]);

    const { messageStrategy } = await inquirer.prompt<{
      messageStrategy: "original" | "custom";
    }>([
      {
        type: "list",
        name: "messageStrategy",
        message: "How do you want to handle the commit message?",
        choices: [
          { name: "Reuse the original commit messages", value: "original" },
          { name: "Create a new commit message", value: "custom" },
        ],
        default: "original",
      },
    ]);

    let customMessage: string | undefined;
    if (messageStrategy === "custom") {
      const { newMessage } = await inquirer.prompt<{ newMessage: string }>([
        {
          type: "input",
          name: "newMessage",
          message: "Write the message for the combined commit",
          validate: (value: string) =>
            value.trim().length > 0 || "The commit message cannot be empty.",
        },
      ]);
      customMessage = newMessage.trim();
    }

    const { applyMode } = await inquirer.prompt<{
      applyMode: "commit" | "no-commit";
    }>([
      {
        type: "list",
        name: "applyMode",
        message: "Do you want to create commits or only apply the changes?",
        choices: [
          { name: "Apply and create commits", value: "commit" },
          { name: "Only apply the changes (no commit)", value: "no-commit" },
        ],
        default: "commit",
      },
    ]);

    const commitByHash = new Map(commits.map(commit => [commit.hash, commit]));
    const selectedCommitEntities = selectedCommits
      .map(hash => commitByHash.get(hash))
      .filter((commit): commit is GitCommit => commit !== undefined);

    return {
      selectedCommits: selectedCommitEntities,
      messageStrategy,
      customMessage,
      applyMode,
    };
  }
}
