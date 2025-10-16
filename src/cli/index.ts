import process from "node:process";
import { fileURLToPath } from "node:url";

import { NestFactory } from "@nestjs/core";
import chalk from "chalk";
import { Command } from "commander";

import { CliModule } from "@/src/interfaces/cli/cli.module";
import { CommanderService } from "@/src/interfaces/cli/commander.service";
import { HandledCliError } from "@/src/interfaces/cli/errors/handled-cli.error";

import "reflect-metadata";

const packageMetadata = {
  version: __PACKAGE_VERSION__,
  description: __PACKAGE_DESCRIPTION__,
};

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = new Command();

  program
    .name("git-tools")
    .description(packageMetadata.description ?? "Interactive Git tools")
    .version(packageMetadata.version);

  const appContext = await NestFactory.createApplicationContext(
    CliModule.register({ program }),
    { logger: false },
  );

  try {
    const commanderService = appContext.get(CommanderService);
    commanderService.configure();

    await program.parseAsync(argv);
  } catch (error) {
    if (!(error instanceof HandledCliError)) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(message));
      process.exitCode = 1;
    }
  } finally {
    await appContext.close();
  }
}

const isDirectExecution = fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectExecution) {
  runCli();
}
