export interface GitLogFilters {
  readonly author?: string;
  readonly since?: string;
  readonly until?: string;
  readonly grep?: string;
}

export interface GitLogRequest {
  readonly sourceBranch: string;
  readonly targetBranch: string;
  readonly filters?: GitLogFilters;
}
