import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { CherryPickService } from "@/src/application/cherry-pick/cherry-pick.service";
import { CherryPickOptionsDto } from "@/src/application/cherry-pick/dto/cherry-pick-options.dto";
import { CherryPickPrompterPort } from "@/src/application/cherry-pick/ports/cherry-pick-prompter.port";
import { GitRepositoryPort } from "@/src/domain/git/git.repository";
import { GitCommit } from "@/src/domain/git/git-commit.entity";

function createCommit(partial: Partial<GitCommit> = {}): GitCommit {
  return {
    hash: "1234567",
    message: "feat: add something",
    authorName: "Jane Doe",
    authorEmail: "jane@example.com",
    authoredDate: new Date("2024-01-01T12:00:00Z"),
    ...partial,
  };
}

describe("CherryPickService", () => {
  let gitRepository: GitRepositoryPort;
  let prompter: CherryPickPrompterPort;
  let service: CherryPickService;
  const defaultOptions: CherryPickOptionsDto = { from: "feature" };

  beforeEach(() => {
    gitRepository = {
      getCurrentBranch: vi.fn().mockResolvedValue("main"),
      ensureBranchExists: vi.fn().mockResolvedValue(undefined),
      getCommitsBetween: vi.fn().mockResolvedValue([]),
      cherryPick: vi.fn().mockResolvedValue(undefined),
      createCommit: vi.fn().mockResolvedValue(undefined),
    };

    prompter = {
      prompt: vi.fn(),
    };

    service = new CherryPickService(gitRepository, prompter);
  });

  it("returns no-commits when there are no differences", async () => {
    const result = await service.execute(defaultOptions);

    expect(result.status).toBe("no-commits");
    expect(result.message).toContain("No commits found");
    expect(gitRepository.getCommitsBetween).toHaveBeenCalledWith({
      sourceBranch: "main",
      targetBranch: "feature",
      filters: {
        author: undefined,
        since: undefined,
        until: undefined,
        grep: undefined,
      },
    });
  });

  it("returns cancelled when the selection is empty", async () => {
    const commit = createCommit();
    (gitRepository.getCommitsBetween as Mock).mockResolvedValue([commit]);
    (prompter.prompt as Mock).mockResolvedValue({
      selectedCommits: [],
      messageStrategy: "original",
      applyMode: "commit",
    });

    const result = await service.execute(defaultOptions);

    expect(result.status).toBe("cancelled");
    expect(gitRepository.cherryPick).not.toHaveBeenCalled();
  });

  it("applies commits and creates a new commit when requested", async () => {
    const commit = createCommit();
    (gitRepository.getCommitsBetween as Mock).mockResolvedValue([commit]);
    (prompter.prompt as Mock).mockResolvedValue({
      selectedCommits: [commit],
      messageStrategy: "custom",
      customMessage: "feat: combined commit",
      applyMode: "commit",
    });

    const result = await service.execute(defaultOptions);

    expect(result.status).toBe("applied");
    expect(gitRepository.cherryPick).toHaveBeenCalledWith([commit.hash], {
      noCommit: true,
    });
    expect(gitRepository.createCommit).toHaveBeenCalledWith(
      "feat: combined commit",
    );
  });

  it("reuses original messages when requested", async () => {
    const commit = createCommit();
    (gitRepository.getCommitsBetween as Mock).mockResolvedValue([commit]);
    (prompter.prompt as Mock).mockResolvedValue({
      selectedCommits: [commit],
      messageStrategy: "original",
      applyMode: "commit",
    });

    const result = await service.execute(defaultOptions);

    expect(result.status).toBe("applied");
    expect(gitRepository.cherryPick).toHaveBeenCalledWith([commit.hash], {
      noCommit: false,
    });
    expect(gitRepository.createCommit).not.toHaveBeenCalled();
  });
});
