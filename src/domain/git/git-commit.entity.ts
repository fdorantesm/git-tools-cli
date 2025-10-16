export interface GitCommit {
  readonly hash: string;
  readonly message: string;
  readonly authorName: string;
  readonly authorEmail: string;
  readonly authoredDate: Date;
}
