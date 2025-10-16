export abstract class GitError extends Error {
  protected constructor(message: string, cause?: unknown) {
    super(message, { cause });
  }
}
