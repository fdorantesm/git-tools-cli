import { GitError } from "./git.error";

export class CherryPickConflictError extends GitError {
  constructor(cause?: unknown) {
    super(
      "Cherry-pick resulted in conflicts. Resolve them manually and retry.",
      cause,
    );
  }
}
