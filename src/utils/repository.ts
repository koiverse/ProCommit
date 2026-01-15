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
      return candidates[0];
    } else if (candidates.length > 1) {
      candidates.sort((a, b) => {
        const aRoot = (a.rootUri?.fsPath ?? a.rootUri?.path ?? '').length;
        const bRoot = (b.rootUri?.fsPath ?? b.rootUri?.path ?? '').length;
        return bRoot - aRoot;
      });
      return candidates[0];
    }
  }

  // Ask user to pick a repository when multiple repositories are present
  const picks = repositories.map((r, idx) => {
    const label = r.rootUri?.fsPath ?? r.rootUri?.path ?? `Repository ${idx + 1}`;
    return {
      label,
      idx,
    };
  });

  const selection = await vscode.window.showQuickPick(
    picks.map((p) => ({ label: p.label, description: "" })),
    {
      placeHolder: "Select a repository to use for ProCommit",
    }
  );

  if (!selection) {
    throw new Error("Repository selection cancelled");
  }

  const selected = picks.find((p) => p.label === selection.label);
  if (!selected) throw new Error("Repository selection failed");

  return repositories[selected.idx];
}
