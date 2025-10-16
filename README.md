# Git Tools CLI

Git Tools CLI is a NestJS standalone application packaged as a CLI to automate advanced Git workflows. The project follows Domain-Driven Design (DDD) with a hexagonal architecture so that the domain logic, application use cases, infrastructure adapters, and delivery mechanisms evolve independently. The initial feature set focuses on an interactive cherry-pick experience powered by Commander and an abstracted prompt engine.

## 🚀 Installation

> **Prerequisite:** Node.js 24 or newer with Corepack enabled.

```bash
yarn global add git-tools-cli
```

You can also run the CLI without a global install using `yarn dlx`:

```bash
yarn dlx git-tools-cli cherry-pick --from origin/feature-branch
```

## 🧭 Usage

```bash
git-tools cherry-pick --from <source-branch> [options]
```

When the command runs:

1. The CLI resolves the current branch and loads the commits that exist on `<source-branch>` but not on your working branch, automatically excluding merge commits.
2. Filters familiar to `git log` (`--author`, `--since`, `--until`, `--grep`) are applied before presenting the commits.
3. The user selects the commits to apply through an interactive, color-friendly prompt that is decoupled from the Inquirer implementation.
4. The workflow asks whether to reuse the original commit messages or create a single commit with a custom message.
5. Finally, the CLI confirms if it should create commits or simply apply the changes to the working tree so they can be reviewed manually.

### Available options

| Option                  | Description                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| `-f, --from <branch>`   | Source branch to cherry-pick from (required).                          |
| `-a, --author <author>` | Filter commits by author (`git log --author`).                         |
| `--since <date>`        | Include commits authored after the provided date (`git log --since`).  |
| `--until <date>`        | Include commits authored before the provided date (`git log --until`). |
| `-g, --grep <pattern>`  | Filter commits whose message matches the pattern (`git log --grep`).   |

> ℹ️ All commands run against the current repository. Make sure your working tree is clean before applying a cherry-pick.

## 🧱 Architecture overview

The codebase is organized around DDD and hexagonal principles:

- **Domain layer (`src/domain`)** — aggregates Git concepts such as commits, log filters, and domain-specific errors.
- **Application layer (`src/application`)** — exposes use cases like `CherryPickService`, orchestrating domain logic through well-defined ports.
- **Infrastructure layer (`src/infrastructure`)** — implements the ports with adapters, for example the Simple Git repository and the Inquirer-backed prompter.
- **Interface layer (`src/interfaces`)** — delivers the CLI via NestJS standalone contexts and Commander commands.
- **Shared utilities (`src/shared`)** — centralizes dependency injection tokens that connect the layers.

This structure keeps user experience details, third-party integrations, and domain rules isolated so the CLI can scale with additional commands without sacrificing maintainability.

## 🛠️ Scripts

| Command         | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `yarn build`    | Produces the distribution bundle and TypeScript declarations using Vite. |
| `yarn test`     | Runs the unit test suite with Vitest.                                    |
| `yarn lint`     | Executes ESLint across the source code.                                  |
| `yarn lint:fix` | Attempts to automatically fix linting issues.                            |

## 🧪 Testing

Tests are written with Vitest. Execute them locally with:

```bash
yarn test
```

## 📦 Publishing

Publishing to npm is automated through the **Publish Package** workflow:

- Merges to `main` trigger tests, build the package, and publish the stable version to npm.
- Merges to `dev` publish a pre-release tagged with the `dev` dist-tag and a `-dev` suffix.

> ⚠️ Do not commit the `dist/` folder to the repository. Distribution artifacts are generated automatically as part of the
> release workflows when changes land on `dev` or `main`.

To enable the pipeline configure the `NPM_TOKEN` secret with publish access. If you ever need to publish manually, run `yarn build` before executing `npm publish` so that the `dist` folder is up to date.

## 🤝 Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/amazing-improvement`.
2. Install dependencies with `yarn install`.
3. Run linting and tests before opening a pull request.
4. Document any new workflow or command you introduce.

## 👥 Project team

- **Fernando Dorantes** — Maintainer and active developer.
- **Albert Hernandez** — Original template author and initial developer of the TypeScript library skeleton this project builds upon.

## 🙏 Acknowledgements

This CLI started from the [TypeScript Library Skeleton](https://github.com/AlbertHernandez/typescript-library-skeleton) by Albert Hernandez. Their work laid the foundation that allowed this tooling to evolve quickly.

Thanks for contributing to better Git automation! 🚀
