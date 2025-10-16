import { DynamicModule, Module } from "@nestjs/common";
import { Command } from "commander";

import { CherryPickService } from "@/src/application/cherry-pick/cherry-pick.service";
import { CherryPickPrompterPort } from "@/src/application/cherry-pick/ports/cherry-pick-prompter.port";
import { GitRepositoryPort } from "@/src/domain/git/git.repository";
import { InfrastructureModule } from "@/src/infrastructure/infrastructure.module";
import {
  CHERRY_PICK_PROMPTER,
  COMMANDER_PROGRAM,
  GIT_REPOSITORY,
} from "@/src/shared/tokens";

import { CommanderService } from "./commander.service";
import { CherryPickCommand } from "./commands/cherry-pick.command";

@Module({})
export class CliModule {
  static register(options: { program: Command }): DynamicModule {
    return {
      module: CliModule,
      imports: [InfrastructureModule],
      providers: [
        { provide: COMMANDER_PROGRAM, useValue: options.program },
        {
          provide: CherryPickService,
          useFactory: (
            gitRepository: GitRepositoryPort,
            prompter: CherryPickPrompterPort,
          ) => new CherryPickService(gitRepository, prompter),
          inject: [GIT_REPOSITORY, CHERRY_PICK_PROMPTER],
        },
        CherryPickCommand,
        CommanderService,
      ],
      exports: [CommanderService],
    };
  }
}
