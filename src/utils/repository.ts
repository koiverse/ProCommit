import * as vscode from "vscode";
import * as path from "path";

import { GitExtension } from "@procommit/scm/types";

export async function getRepositoryFromGitExtension(
  gitExtension: vscode.Extension<GitExtension>
) {
  if (!gitExtension.isActive) {
    throw new Error("Git extension is not active");
  }

  const api = gitExtension.exports.getAPI(1);
  const repositories = api.repositories;

  if (repositories.length === 0) {
    throw new Error("No repositories found");
  }

  // If only one repository, return it
  if (repositories.length === 1) return repositories[0];

  const getStagedCount = (r: (typeof repositories)[number]) => {
    const indexCount = r.state?.indexChanges?.length ?? 0;
    const mergeCount = r.state?.mergeChanges?.length ?? 0;
    return indexCount + mergeCount;
  };

  const repositoriesWithStagedChanges = repositories.filter((r) => {
    return getStagedCount(r) > 0;
  });

  const selectedRepositories = repositories.filter((r) => r.ui?.selected);
  const selectedRepositoriesWithStagedChanges = selectedRepositories.filter(
    (r) => getStagedCount(r) > 0
  );

  if (selectedRepositoriesWithStagedChanges.length === 1) {
    return selectedRepositoriesWithStagedChanges[0];
  }

  if (repositoriesWithStagedChanges.length === 1) {
    return repositoriesWithStagedChanges[0];
  }

  // Try to find repository for active editor
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const activeFilePath = activeEditor.document.uri.fsPath;
    const candidates = repositories.filter((r) => {
      const rootPath = r.rootUri?.fsPath ?? r.rootUri?.path;
      if (!rootPath) return false;
      return activeFilePath.startsWith(rootPath + path.sep) || activeFilePath === rootPath;
    });
    if (candidates.length === 1) {
      const candidate = candidates[0];
      if (
        repositoriesWithStagedChanges.length === 0 ||
        repositoriesWithStagedChanges.includes(candidate)
      ) {
        return candidate;
      }
    } else if (candidates.length > 1) {
      const stagedCandidates =
        repositoriesWithStagedChanges.length > 0
          ? candidates.filter((r) => repositoriesWithStagedChanges.includes(r))
          : candidates;

      if (repositoriesWithStagedChanges.length > 0 && stagedCandidates.length === 0) {
      } else {
        stagedCandidates.sort((a, b) => {
        const aRoot = (a.rootUri?.fsPath ?? a.rootUri?.path ?? '').length;
        const bRoot = (b.rootUri?.fsPath ?? b.rootUri?.path ?? '').length;
        return bRoot - aRoot;
        });
        return stagedCandidates[0];
      }
    }
  }

  if (repositoriesWithStagedChanges.length === 0 && selectedRepositories.length === 1) {
    return selectedRepositories[0];
  }

  const pickSource =
    repositoriesWithStagedChanges.length > 0 ? repositoriesWithStagedChanges : repositories;

  const picks = pickSource.map((r, idx) => {
    const rootPath = r.rootUri?.fsPath ?? r.rootUri?.path ?? `Repository ${idx + 1}`;
    const stagedCount = getStagedCount(r);
    return {
      label: rootPath,
      description: stagedCount > 0 ? `${stagedCount} staged` : "",
      idx,
    };
  });

  const selection = await vscode.window.showQuickPick(
    picks.map((p) => ({ label: p.label, description: p.description })),
    {
      placeHolder: "Select a repository to use for ProCommit",
    }
  );

  if (!selection) {
    throw new Error("Repository selection cancelled");
  }

  const selected = picks.find((p) => p.label === selection.label);
  if (!selected) throw new Error("Repository selection failed");

  return pickSource[selected.idx];
}
