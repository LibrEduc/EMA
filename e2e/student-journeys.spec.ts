import {
  blockTypes,
  chooseOption,
  closeSettings,
  createVariable,
  dragFromFlyout,
  dragToTrash,
  editField,
  expect,
  expectCode,
  expectNumericSockets,
  openSettings,
  setupLoopId,
  test,
  unpinFlyout,
} from "./helpers";

test("a new page offers an empty setup and loop block and idle code in both targets", async ({
  app,
}) => {
  const { page } = app;

  expect(await blockTypes(page)).toEqual(["board_base_setup_loop"]);
  await expectCode(page, "arduino", `
void setup() {
}

void loop() {
}`);
  await expectCode(page, "micropython", `
# --- setup ---

# --- loop ---
while True:
  pass`);
  expect(app.problems).toEqual([]);
});

test("a student counts with a variable incremented in the loop", async ({ app }) => {
  const { page } = app;
  await unpinFlyout(page);
  const root = await setupLoopId(page);

  await createVariable(page, "compteur");
  const initialise = await dragFromFlyout(page, { category: "Variables", type: "variables_set_dynamic" }, { blockId: root, input: "SETUP" });
  const zero = await dragFromFlyout(page, { category: "Math", type: "math_number" }, { blockId: initialise, input: "VALUE" });
  await editField(page, zero, "NUM", "0");

  const increase = await dragFromFlyout(page, { category: "Variables", type: "variables_set_dynamic" }, { blockId: root, input: "LOOP" });
  const sum = await dragFromFlyout(page, { category: "Math", type: "math_arithmetic" }, { blockId: increase, input: "VALUE" });
  await dragFromFlyout(page, { category: "Variables", type: "variables_get_dynamic" }, { blockId: sum, input: "A" });
  const one = await dragFromFlyout(page, { category: "Math", type: "math_number" }, { blockId: sum, input: "B" });
  await editField(page, one, "NUM", "1");

  const show = await dragFromFlyout(page, { category: "Texte", type: "text_print" }, { blockId: increase, next: true });
  await dragFromFlyout(page, { category: "Variables", type: "variables_get_dynamic" }, { blockId: show, input: "TEXT" });

  await expectCode(page, "micropython", `
# --- setup ---
compteur = 0

# --- loop ---
while True:
  compteur = compteur + 1
  print(compteur)`);
  await expectCode(page, "arduino", `
int compteur;

void setup() {
  compteur = 0;
  Serial.begin(9600);
}

void loop() {
  compteur = compteur + 1;
  Serial.print(String(compteur));
}`);
  expect(app.problems).toEqual([]);
});

test("a student repeats ten times a message guarded by a numeric condition", async ({ app }) => {
  const { page } = app;
  await unpinFlyout(page);
  const root = await setupLoopId(page);

  const repeat = await dragFromFlyout(page, { category: "Boucles", type: "controls_repeat_ext" }, { blockId: root, input: "LOOP" });
  const times = await dragFromFlyout(page, { category: "Math", type: "math_number" }, { blockId: repeat, input: "TIMES" });
  await editField(page, times, "NUM", "10");
  const condition = await dragFromFlyout(page, { category: "Logique", type: "controls_if" }, { blockId: repeat, input: "DO" });
  const compare = await dragFromFlyout(page, { category: "Logique", type: "logic_compare" }, { blockId: condition, input: "IF0" });
  await chooseOption(page, compare, "OP", "<");
  await expectNumericSockets(page, compare);
  const left = await dragFromFlyout(page, { category: "Math", type: "math_number" }, { blockId: compare, input: "A" });
  await editField(page, left, "NUM", "3");
  const right = await dragFromFlyout(page, { category: "Math", type: "math_number" }, { blockId: compare, input: "B" });
  await editField(page, right, "NUM", "5");
  const show = await dragFromFlyout(page, { category: "Texte", type: "text_print" }, { blockId: condition, input: "DO0" });
  const message = await dragFromFlyout(page, { category: "Texte", type: "text" }, { blockId: show, input: "TEXT" });
  await editField(page, message, "TEXT", "ok");

  await expectCode(page, "micropython", `
# --- setup ---

# --- loop ---
while True:
  for count in range(10):
    if 3 < 5:
      print('ok')`);
  await expectCode(page, "arduino", `
void setup() {
  Serial.begin(9600);
}

void loop() {
  for (int count = 0; count < 10; count++) {
    if (3 < 5) {
      Serial.print(String("ok"));
    }
  }
}`);
  expect(app.problems).toEqual([]);
});

test("a message with an apostrophe, quotes and an emoji joined to an arithmetic result stays valid code", async ({
  app,
}) => {
  const { page } = app;
  await unpinFlyout(page);
  const root = await setupLoopId(page);

  const show = await dragFromFlyout(page, { category: "Texte", type: "text_print" }, { blockId: root, input: "LOOP" });
  const join = await dragFromFlyout(page, { category: "Texte", type: "text_join" }, { blockId: show, input: "TEXT" });
  const message = await dragFromFlyout(page, { category: "Texte", type: "text" }, { blockId: join, input: "ADD0" });
  await editField(page, message, "TEXT", `l'école "é" 😀 : `);
  const sum = await dragFromFlyout(page, { category: "Math", type: "math_arithmetic" }, { blockId: join, input: "ADD1" });
  const left = await dragFromFlyout(page, { category: "Math", type: "math_number" }, { blockId: sum, input: "A" });
  await editField(page, left, "NUM", "2");
  const right = await dragFromFlyout(page, { category: "Math", type: "math_number" }, { blockId: sum, input: "B" });
  await editField(page, right, "NUM", "3");

  await expectCode(page, "micropython", `
# --- setup ---

# --- loop ---
while True:
  print('l\\'école "é" 😀 : ' + str(2 + 3))`);
  await expectCode(page, "arduino", `
void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.print(String(String("l'école \\"é\\" 😀 : ") + String(2 + 3)));
}`);
  expect(app.problems).toEqual([]);
});

test("renaming a variable renames it in the code, deleting it removes its blocks after a confirmation", async ({
  app,
}) => {
  const { page } = app;
  await unpinFlyout(page);
  const root = await setupLoopId(page);

  await createVariable(page, "score");
  const assign = await dragFromFlyout(page, { category: "Variables", type: "variables_set_dynamic" }, { blockId: root, input: "SETUP" });
  const show = await dragFromFlyout(page, { category: "Texte", type: "text_print" }, { blockId: root, input: "LOOP" });
  await dragFromFlyout(page, { category: "Variables", type: "variables_get_dynamic" }, { blockId: show, input: "TEXT" });

  await chooseOption(page, assign, "VAR", "Renommer");
  const dialog = page.locator("dialog.blocklyDialog");
  await dialog.locator("input").fill("points");
  await dialog.getByRole("button", { name: "OK" }).click();
  await expectCode(page, "micropython", `
# --- setup ---
points = 0

# --- loop ---
while True:
  print(points)`);
  await expectCode(page, "arduino", `
int points;

void setup() {
  points = 0;
  Serial.begin(9600);
}

void loop() {
  Serial.print(String(points));
}`);

  await chooseOption(page, assign, "VAR", "Supprimer");
  await expect(dialog).toContainText("Supprimer 2 utilisations de la variable « points » ?");
  await dialog.getByRole("button", { name: "OK" }).click();
  await expect.poll(() => blockTypes(page)).toEqual(["board_base_setup_loop", "text_print"]);
  expect(app.problems).toEqual([]);
});

test("a student undoes a block, trashes another and starts over", async ({ app }) => {
  const { page } = app;
  await unpinFlyout(page);
  const root = await setupLoopId(page);
  page.on("dialog", (dialog) => void dialog.accept());

  await dragFromFlyout(page, { category: "Texte", type: "text_print" }, { blockId: root, input: "LOOP" });
  await page.locator("#ema-undo").click();
  await expect.poll(() => blockTypes(page)).toEqual(["board_base_setup_loop"]);

  const show = await dragFromFlyout(page, { category: "Texte", type: "text_print" }, { blockId: root, input: "LOOP" });
  await dragToTrash(page, show);
  await expect.poll(() => blockTypes(page)).toEqual(["board_base_setup_loop"]);

  await dragFromFlyout(page, { category: "Texte", type: "text_print" }, { blockId: root, input: "LOOP" });
  await page.getByRole("button", { name: "Recommencer" }).click();
  await expect.poll(() => blockTypes(page)).toEqual(["board_base_setup_loop"]);
  await expectCode(page, "arduino", `
void setup() {
}

void loop() {
}`);
  expect(app.problems).toEqual([]);
});

test("switching the language keeps a program without comparison and translates the interface", async ({
  app,
}) => {
  const { page } = app;
  await unpinFlyout(page);
  const root = await setupLoopId(page);

  const show = await dragFromFlyout(page, { category: "Texte", type: "text_print" }, { blockId: root, input: "LOOP" });
  const message = await dragFromFlyout(page, { category: "Texte", type: "text" }, { blockId: show, input: "TEXT" });
  await editField(page, message, "TEXT", "salut");
  await expectCode(page, "micropython", `
# --- setup ---

# --- loop ---
while True:
  print('salut')`);

  await openSettings(page);
  await page.locator("#ema-lang").selectOption("en");
  await closeSettings(page);

  await expect(page.locator("#ema-undo")).toHaveText("Undo");
  await expect.poll(() => blockTypes(page)).toEqual(["board_base_setup_loop", "text_print", "text"]);
  await expectCode(page, "micropython", `
# --- setup ---

# --- loop ---
while True:
  print('salut')`);
  expect(app.problems).toEqual([]);
});
