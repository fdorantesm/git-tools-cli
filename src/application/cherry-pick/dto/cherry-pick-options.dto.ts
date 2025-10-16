export interface CherryPickOptionsDto {
  readonly from: string;
  readonly author?: string;
  readonly since?: string;
  readonly until?: string;
  readonly grep?: string;
}
