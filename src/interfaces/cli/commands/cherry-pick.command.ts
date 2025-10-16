import { Injectable } from "@nestjs/common";
import chalk from "chalk";
import { Command } from "commander";

import { CherryPickService } from "@/src/application/cherry-pick/cherry-pick.service";
import { CherryPickOptionsDto } from "@/src/application/cherry-pick/dto/cherry-pick-options.dto";
import { CherryPickResultDto } from "@/src/application/cherry-pick/dto/cherry-pick-result.dto";
import { BranchNotFoundError } from "@/src/domain/git/errors/branch-not-found.error";
import { CherryPickConflictError } from "@/src/domain/git/errors/cherry-pick-conflict.error";
import { HandledCliError } from "@/src/interfaces/cli/errors/handled-cli.error";

@Injectable()
export class CherryPickCommand {
  constructor(private readonly cherryPickService: CherryPickService) {}

  build(): Command {
    return new Command("cherry-pick")
      .description(
        "Interactively cherry-pick commits from another branch without merges.",
      )
      .summary("Interactive cherry-pick with git-like filters.")
      .requiredOption("-f, --from <branch>", "Branch to cherry-pick from")
      .option("-a, --author <author>", "Filter by author (git log --author)")
      .option("--since <date>", "Lower date bound (git log --since)")
      .option("--until <date>", "Upper date bound (git log --until)")
      .option(
        "-g, --grep <pattern>",
        "Filter by commit message (git log --grep)",
      )
      .action(async (options: CherryPickOptionsDto) => {
        await this.handleAction(options);
      });
  }

  private async handleAction(options: CherryPickOptionsDto): Promise<void> {
    try {
      const result = await this.cherryPickService.execute(options);
      this.printResult(result);
    } catch (error) {
      this.handleError(error);
      throw new HandledCliError();
    }
  }

  private printResult(result: CherryPickResultDto): void {
    const appliedCommitsMessage =
      result.appliedCommits && result.appliedCommits > 0
        ? chalk.cyan(`${result.appliedCommits} commit(s)`) + " "
        : "";

    switch (result.status) {
      case "no-commits":
        console.log(chalk.yellow(result.message));
        break;
      case "cancelled":
        console.log(chalk.yellow(result.message));
        break;
      case "applied":
        console.log(chalk.green(`${appliedCommitsMessage}${result.message}`));
        break;
      default:
        console.log(result.message);
        break;
    }
  }

  private handleError(error: unknown): void {
    if (error instanceof BranchNotFoundError) {
      console.error(chalk.red(error.message));
      process.exitCode = 1;
      return;
    }

    if (error instanceof CherryPickConflictError) {
      console.error(chalk.red(error.message));
      process.exitCode = 1;
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`Unable to complete the cherry-pick: ${message}`));
    process.exitCode = 1;
  }
}
