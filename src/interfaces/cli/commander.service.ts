import { Inject, Injectable } from "@nestjs/common";
import { Command } from "commander";

import { COMMANDER_PROGRAM } from "@/src/shared/tokens";

import { CherryPickCommand } from "./commands/cherry-pick.command";

@Injectable()
export class CommanderService {
  constructor(
    @Inject(COMMANDER_PROGRAM) private readonly program: Command,
    private readonly cherryPickCommand: CherryPickCommand,
  ) {}

  configure(): void {
    this.program.addCommand(this.cherryPickCommand.build());
  }
}
