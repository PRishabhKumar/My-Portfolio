import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { BOOT, typed, CD_COMMAND, NPM_COMMAND } from "../src/boot-sequence.js";
const pauses = {
  startMenu: BOOT.search - BOOT.start,
  terminalBeforeTyping: BOOT.cd - BOOT.terminal,
  betweenCommands: BOOT.npm - BOOT.cdEnter,
  readOutput: BOOT.point - BOOT.local,
};
assert.ok(pauses.startMenu >= 1500);
assert.ok(pauses.terminalBeforeTyping >= 1500);
assert.ok(pauses.betweenCommands >= 1200);
assert.ok(pauses.readOutput >= 2000);
assert.equal(typed(CD_COMMAND, BOOT.cd - 1, BOOT.cd, BOOT.cdEnd), "");
assert.equal(
  typed(CD_COMMAND, BOOT.cdEnd + 1, BOOT.cd, BOOT.cdEnd),
  CD_COMMAND,
);
assert.equal(typed(NPM_COMMAND, BOOT.npm - 1, BOOT.npm, BOOT.npmEnd), "");
const result = {
  seconds: (BOOT.click + BOOT.exit) / 1000,
  pausesMs: pauses,
  status: "Relaxed Command Prompt pacing preserved.",
};
await writeFile(
  "qa/intro-pacing-results.json",
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
