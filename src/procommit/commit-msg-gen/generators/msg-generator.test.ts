import assert from "node:assert/strict";
import test from "node:test";
import { buildOllamaGenerateUrl, createDiffAnalysis, createDiffAwareUserPrompt, postProcessCommitMessage } from "./msg-generator";

test("createDiffAnalysis extracts file paths and identifiers", () => {
  const diff = [
    "diff --git a/src/api/client.ts b/src/api/client.ts",
    "index 1111111..2222222 100644",
    "--- a/src/api/client.ts",
    "+++ b/src/api/client.ts",
    "@@",
    "-export function fetchUser(id: string) {",
    "+export async function fetchUser(id: string) {",
    "+  return await getJSON(`/api/users/${id}`);",
    " }",
    "",
  ].join("\n");

  const analysis = createDiffAnalysis(diff);
  assert.equal(analysis.files[0]?.path, "src/api/client.ts");
  assert.ok(analysis.primaryIdentifiers.includes("fetchUser"));
});

test("postProcessCommitMessage normalizes type and scope without lowercasing subject", () => {
  const diff = [
    "diff --git a/src/api/client.ts b/src/api/client.ts",
    "index 1111111..2222222 100644",
    "--- a/src/api/client.ts",
    "+++ b/src/api/client.ts",
    "@@",
    "+export function refreshOAuthToken() {}",
    "",
  ].join("\n");

  const { analysis } = createDiffAwareUserPrompt(diff);
  const message = postProcessCommitMessage(
    "FEAT(src/api/client.ts): Add HTTP OAuth refresh",
    { includeFileExtension: true, analysis }
  );

  assert.equal(message, "feat(client.ts): Add HTTP OAuth refresh");
});

test("postProcessCommitMessage strips file extension from scope when disabled", () => {
  const diff = [
    "diff --git a/src/api/file.js b/src/api/file.js",
    "index 1111111..2222222 100644",
    "--- a/src/api/file.js",
    "+++ b/src/api/file.js",
    "@@",
    "+export function doThing() {}",
    "",
  ].join("\n");

  const { analysis } = createDiffAwareUserPrompt(diff);
  const message = postProcessCommitMessage("feat(file.js): Add doThing", {
    includeFileExtension: false,
    analysis,
  });

  assert.equal(message, "feat(file): Add doThing");
});

test("postProcessCommitMessage falls back when subject is too generic", () => {
  const diff = [
    "diff --git a/src/api/client.ts b/src/api/client.ts",
    "index 1111111..2222222 100644",
    "--- a/src/api/client.ts",
    "+++ b/src/api/client.ts",
    "@@",
    "-export function fetchUser(id: string) {",
    "+export async function fetchUser(id: string) {",
    "+  return await getJSON(`/api/users/${id}`);",
    " }",
    "",
  ].join("\n");

  const { analysis } = createDiffAwareUserPrompt(diff);
  const message = postProcessCommitMessage("chore(client.ts): update code", {
    includeFileExtension: true,
    analysis,
  });

  assert.ok(message.includes("fetchUser"));
});

test("buildOllamaGenerateUrl normalizes base endpoint", () => {
  assert.equal(buildOllamaGenerateUrl("http://localhost:11434"), "http://localhost:11434/api/generate");
  assert.equal(buildOllamaGenerateUrl("http://localhost:11434/"), "http://localhost:11434/api/generate");
  assert.equal(buildOllamaGenerateUrl("http://localhost:11434/api"), "http://localhost:11434/api/generate");
  assert.equal(buildOllamaGenerateUrl("http://localhost:11434/api/"), "http://localhost:11434/api/generate");
  assert.equal(buildOllamaGenerateUrl("http://localhost:11434/api/generate"), "http://localhost:11434/api/generate");
  assert.equal(buildOllamaGenerateUrl("http://localhost:11434/api/generate/"), "http://localhost:11434/api/generate");
});
