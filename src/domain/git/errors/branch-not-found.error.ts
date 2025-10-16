import { GitError } from "./git.error";

export class BranchNotFoundError extends GitError {
  constructor(branch: string, cause?: unknown) {
    super(`Branch "${branch}" does not exist or cannot be accessed.`, cause);
  }
}
