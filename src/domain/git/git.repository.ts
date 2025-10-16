import { GitCommit } from "./git-commit.entity";
import { GitLogRequest } from "./git-log-request";

export interface CherryPickOptions {
  readonly noCommit: boolean;
}

export interface GitRepositoryPort {
  getCurrentBranch(): Promise<string>;
  ensureBranchExists(branch: string): Promise<void>;
  getCommitsBetween(request: GitLogRequest): Promise<GitCommit[]>;
  cherryPick(
    commits: readonly string[],
    options: CherryPickOptions,
  ): Promise<void>;
  createCommit(message: string): Promise<void>;
}
