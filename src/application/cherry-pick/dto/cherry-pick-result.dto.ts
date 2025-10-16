export type CherryPickResultStatus = "no-commits" | "cancelled" | "applied";

export interface CherryPickResultDto {
  readonly status: CherryPickResultStatus;
  readonly message: string;
  readonly appliedCommits?: number;
}
