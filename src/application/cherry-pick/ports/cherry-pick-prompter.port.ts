import { GitCommit } from "@/src/domain/git/git-commit.entity";

export type CherryPickMessageStrategy = "original" | "custom";
export type CherryPickApplyMode = "commit" | "no-commit";

export interface CherryPickPromptResult {
  readonly selectedCommits: readonly GitCommit[];
  readonly messageStrategy: CherryPickMessageStrategy;
  readonly customMessage?: string;
  readonly applyMode: CherryPickApplyMode;
}

export interface CherryPickPrompterPort {
  prompt(commits: readonly GitCommit[]): Promise<CherryPickPromptResult>;
}
