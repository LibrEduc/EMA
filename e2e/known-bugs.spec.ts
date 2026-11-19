import {
  chooseOption,
  closeSettings,
  createVariable,
  dragFromFlyout,
  editField,
  expect,
  expectNumericSockets,
  openSettings,
  readCode,
  setupLoopId,
  showCode,
  test,
  unpinFlyout,
} from "./helpers";

// Each test states the behaviour students need. Only its last check is expected to fail:
// a journey that breaks earlier fails the test, and so does a bug that gets fixed.
const quickly = { timeout: 3_000 };

async function stillBroken(check: () => Promise<unknown>): Promise<void> {
  // Only a failed assertion means "still broken": a timeout or a script error is rethrown.
  const fixed = await check().then(
    () => true,
    (error: { matcherResult?: unknown }) => {
      if (!error.matcherResult) throw error;
      return false;
    },
  );
  expect(fixed, "the bug is fixed: replace stillBroken(...) by the plain check").toBe(false);
}

test("a numeric comparison survives a language switch", { annotation: { type: "issue", description: "upstream µcBlockly, not tracked yet" } }, async ({ app }) => {
  // Known upstream: reloading the workspace turns "3 < 5" into "0 < 0".
  const { page } = app;
  await unpinFlyout(page);
  const root = await setupLoopId(page);
  const condition = await dragFromFlyout(page, { category: "Logique", type: "controls_if" }, { blockId: root, input: "LOOP" });
  const compare = await dragFromFlyout(page, { category: "Logique", type: "logic_compare" }, { blockId: condition, input: "IF0" });
  await chooseOption(page, compare, "OP", "<");
  await expectNumericSockets(page, compare);
  const left = await dragFromFlyout(page, { category: "Math", type: "math_number" }, { blockId: compare, input: "A" });
  await editField(page, left, "NUM", "3");
  const right = await dragFromFlyout(page, { category: "Math", type: "math_number" }, { blockId: compare, input: "B" });
  await editField(page, right, "NUM", "5");

  await openSettings(page);
  await page.locator("#ema-lang").selectOption("en");
  await closeSettings(page);

  await showCode(page, "micropython");
  await stillBroken(() => expect.poll(() => readCode(page), quickly).toContain("if 3 < 5:"));
});

test("a variable can be compared with a number", { annotation: { type: "issue", description: "upstream µcBlockly, not tracked yet" } }, async ({ app }) => {
  // A plain variable has no type, so the numeric comparison ejects it a few ms after the drop.
  const { page } = app;
  await unpinFlyout(page);
  const root = await setupLoopId(page);
  await createVariable(page, "score");
  const condition = await dragFromFlyout(page, { category: "Logique", type: "controls_if" }, { blockId: root, input: "LOOP" });
  const compare = await dragFromFlyout(page, { category: "Logique", type: "logic_compare" }, { blockId: condition, input: "IF0" });
  await chooseOption(page, compare, "OP", ">");
  await expectNumericSockets(page, compare);
  await dragFromFlyout(page, { category: "Variables", type: "variables_get_dynamic" }, { blockId: compare, input: "A" });
  const limit = await dragFromFlyout(page, { category: "Math", type: "math_number" }, { blockId: compare, input: "B" });
  await editField(page, limit, "NUM", "5");

  await showCode(page, "micropython");
  await stillBroken(() => expect.poll(() => readCode(page), quickly).toContain("if score > 5:"));
});

test("the loop block can be reached with the flyout open as it is on first load", { annotation: { type: "issue", description: "https://github.com/LibrEduc/EMA/issues/14" } }, async ({
  app,
}) => {
  // At 1280px the pinned flyout ends at x=1144 and covers the setup/loop block, so nothing can be dropped in it.
  const { page } = app;
  await stillBroken(async () => {
    const covered = await page.evaluate(() => {
      const block = window.__blockly.getMainWorkspace().getTopBlocks(false)[0] as import("blockly").BlockSvg;
      const box = block.getSvgRoot().getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + 20, box.top + box.height / 2);
      return hit?.closest(".blocklyFlyout") !== null;
    });
    expect(covered).toBe(false);
  });
});

test("an array block does not break the MicroPython code panel", { annotation: { type: "issue", description: "https://github.com/LibrEduc/EMA/issues/10" } }, async ({ app }) => {
  // The Tableaux blocks have an Arduino generator only; the panel then shows an error text.
  const { page } = app;
  await unpinFlyout(page);
  await dragFromFlyout(page, { category: "Tableaux", type: "Array_declare" }, { x: 500, y: 350 });
  await showCode(page, "micropython");
  await stillBroken(async () => {
    await expect.poll(() => readCode(page), quickly).not.toContain("Erreur de génération");
    expect(app.problems).toEqual([]);
  });
});

test("a function defined with blocks is defined in the MicroPython code", { annotation: { type: "issue", description: "https://github.com/LibrEduc/EMA/issues/10, fixed by PR #4" } }, async ({ app }) => {
  // MicroPythonGenerator.finish() drops the function definitions Blockly collects.
  const { page } = app;
  await unpinFlyout(page);
  const root = await setupLoopId(page);
  const definition = await dragFromFlyout(page, { category: "Procédures", type: "procedures_defnoreturn" }, { x: 500, y: 350 });
  await editField(page, definition, "NAME", "saluer");
  const show = await dragFromFlyout(page, { category: "Texte", type: "text_print" }, { blockId: definition, input: "STACK" });
  const message = await dragFromFlyout(page, { category: "Texte", type: "text" }, { blockId: show, input: "TEXT" });
  await editField(page, message, "TEXT", "salut");
  await dragFromFlyout(page, { category: "Procédures", type: "procedures_callnoreturn" }, { blockId: root, input: "LOOP" });

  await showCode(page, "micropython");
  await stillBroken(() => expect.poll(() => readCode(page), quickly).toContain("def saluer():"));
});
