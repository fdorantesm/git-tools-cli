import { Module } from "@nestjs/common";

import { CherryPickService } from "./cherry-pick.service";

@Module({
  providers: [CherryPickService],
  exports: [CherryPickService],
})
export class CherryPickApplicationModule {}
