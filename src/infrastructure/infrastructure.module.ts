import { Module } from "@nestjs/common";

import { CHERRY_PICK_PROMPTER, GIT_REPOSITORY } from "@/src/shared/tokens";

import { SimpleGitRepository } from "./git/simple-git.repository";
import { InquirerCherryPickPrompter } from "./prompts/inquirer-cherry-pick.prompter";

@Module({
  providers: [
    { provide: GIT_REPOSITORY, useClass: SimpleGitRepository },
    { provide: CHERRY_PICK_PROMPTER, useClass: InquirerCherryPickPrompter },
  ],
  exports: [GIT_REPOSITORY, CHERRY_PICK_PROMPTER],
})
export class InfrastructureModule {}
