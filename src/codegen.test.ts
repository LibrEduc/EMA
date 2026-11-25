import * as Blockly from "blockly";
import { registerUcBlocklyKernel } from "µcBlockly/core";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { generateCode, tryGenerateCode } from "./codegen";

type BlockState = Blockly.serialization.blocks.State;

const UNSUPPORTED_TYPE = "ema_test_unsupported";
// Like libre_start: no field text at all.
const UNNAMED_TYPE = "ema_test_unnamed";
// Like board_conversion_toint: its own text, then a value input.
const UNSUPPORTED_WITH_INPUT_TYPE = "ema_test_unsupported_with_input";
// Like the +/- image of a Libre mutator: fields that only show symbols.
const SYMBOLS_ONLY_TYPE = "ema_test_symbols_only";
// Two own text fields, "a" then "b".
const TWO_TEXTS_TYPE = "ema_test_two_texts";
// One typed text field, to test label truncation.
const TYPED_TEXT_TYPE = "ema_test_typed_text";

const emptySetupLoop: BlockState = { type: "board_base_setup_loop" };

function unsupportedIds(workspace: Blockly.Workspace): string[] {
  const result = tryGenerateCode(workspace, "micropython");
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.unsupportedBlocks.map((block) => block.id);
}

function unsupportedLabels(workspace: Blockly.Workspace): string[] {
  const result = tryGenerateCode(workspace, "micropython");
  expect(result.ok).toBe(false);
  return result.ok ? [] : result.unsupportedBlocks.map((block) => block.label);
}

describe("tryGenerateCode (export Hub)", () => {
  let workspace: Blockly.Workspace;

  beforeAll(() => {
    // µcBlockly reads the selected board from a #boardMenu element.
    vi.stubGlobal("document", { getElementById: () => null });
    registerUcBlocklyKernel();
    // A block that exists in the toolbox but has no MicroPython generator.
    Blockly.Blocks[UNSUPPORTED_TYPE] = {
      init(this: Blockly.Block) {
        this.appendDummyInput().appendField("bloc inconnu");
      },
    };
    Blockly.Blocks[UNNAMED_TYPE] = {
      init(this: Blockly.Block) {
        this.appendValueInput("A");
        this.appendValueInput("B");
        this.appendValueInput("C");
      },
    };
    Blockly.Blocks[UNSUPPORTED_WITH_INPUT_TYPE] = {
      init(this: Blockly.Block) {
        this.appendValueInput("VALUE").appendField("convertir");
      },
    };
    Blockly.Blocks[SYMBOLS_ONLY_TYPE] = {
      init(this: Blockly.Block) {
        this.appendDummyInput().appendField("+").appendField("-");
      },
    };
    Blockly.Blocks[TWO_TEXTS_TYPE] = {
      init(this: Blockly.Block) {
        this.appendDummyInput().appendField("a").appendField("b");
      },
    };
    Blockly.Blocks[TYPED_TEXT_TYPE] = {
      init(this: Blockly.Block) {
        this.appendDummyInput().appendField(
          new Blockly.FieldTextInput(""),
          "TEXT",
        );
      },
    };
  });

  beforeEach(() => {
    workspace = new Blockly.Workspace();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    workspace.dispose();
    vi.restoreAllMocks();
  });

  it("returns the generated code for a supported program", () => {
    Blockly.serialization.blocks.append(emptySetupLoop, workspace);

    const result = tryGenerateCode(workspace, "micropython");

    expect(result.ok).toBe(true);
    expect(result.ok && result.code).toContain("while True:");
  });

  it("reports the failing block instead of returning error text as code", () => {
    const block = Blockly.serialization.blocks.append(
      { type: UNSUPPORTED_TYPE },
      workspace,
    );

    const result = tryGenerateCode(workspace, "micropython");

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.unsupportedBlocks).toEqual([
      { id: block.id, type: UNSUPPORTED_TYPE, label: "bloc inconnu" },
    ]);
  });

  it("gives an empty label, and keeps the type, when the block has no readable text", () => {
    const block = Blockly.serialization.blocks.append(
      { type: UNNAMED_TYPE },
      workspace,
    );

    const result = tryGenerateCode(workspace, "micropython");

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.unsupportedBlocks).toEqual([
      { id: block.id, type: UNNAMED_TYPE, label: "" },
    ]);
  });

  it("ignores a disabled unsupported block, which the generator skips", () => {
    Blockly.serialization.blocks.append(emptySetupLoop, workspace);
    Blockly.serialization.blocks.append(
      { type: UNSUPPORTED_TYPE, enabled: false },
      workspace,
    );

    expect(tryGenerateCode(workspace, "micropython").ok).toBe(true);
  });

  it("does not list supported blocks next to the failing one", () => {
    Blockly.serialization.blocks.append(emptySetupLoop, workspace);
    const failing = Blockly.serialization.blocks.append(
      { type: UNSUPPORTED_TYPE },
      workspace,
    );

    expect(unsupportedIds(workspace)).toEqual([failing.id]);
  });

  it("does not list a disabled unsupported block next to the failing one", () => {
    const failing = Blockly.serialization.blocks.append(
      { type: UNSUPPORTED_TYPE },
      workspace,
    );
    Blockly.serialization.blocks.append(
      { type: UNSUPPORTED_TYPE, enabled: false },
      workspace,
    );

    expect(unsupportedIds(workspace)).toEqual([failing.id]);
  });

  it("does not list a block inside a disabled block, which the generator skips", () => {
    const failing = Blockly.serialization.blocks.append(
      { type: UNSUPPORTED_TYPE },
      workspace,
    );
    Blockly.serialization.blocks.append(
      {
        type: "libre_loop",
        enabled: false,
        inputs: {
          LOOP: {
            block: { type: "libre_out", fields: { TEXT: "dans la boucle" } },
          },
        },
      },
      workspace,
    );

    expect(unsupportedIds(workspace)).toEqual([failing.id]);
  });

  it("gives an empty label to an empty Libre block, ignoring the number plugged into it", () => {
    Blockly.serialization.blocks.append(
      {
        type: "libre_in_out",
        inputs: { VALUE: { block: { type: "math_number", fields: { NUM: 5 } } } },
      },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual([""]);
  });

  it("labels a Libre block with the text typed in it", () => {
    Blockly.serialization.blocks.append(
      { type: "libre_out", fields: { TEXT: "mon code" } },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual(["mon code"]);
  });

  it("labels a Libre block with its own text, not the blocks plugged into it", () => {
    Blockly.serialization.blocks.append(
      {
        type: "libre_in_out",
        fields: { TEXT: "vitesse" },
        inputs: { VALUE: { block: { type: "math_number", fields: { NUM: 5 } } } },
      },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual(["vitesse"]);
  });

  it("labels a Libre « do » loop with the text typed in its second field", () => {
    Blockly.serialization.blocks.append(
      { type: "libre_loop_do_inside", fields: { TEXT_DO: "avancer" } },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual(["avancer"]);
  });

  it("labels a Libre loop with the text typed in its second text field", () => {
    // Both text fields are named TEXT, so serialization can only fill the first one.
    const loop = workspace.newBlock("libre_loop_with_return");
    const textFields = [...loop.getFields()].filter(
      (field) => field instanceof Blockly.FieldTextInput,
    );
    textFields[1]?.setValue("retourner");

    expect(unsupportedLabels(workspace)).toEqual(["retourner"]);
  });

  it("gives an empty label to an empty Libre loop, ignoring its built-in « faire » label", () => {
    Blockly.serialization.blocks.append(
      { type: "libre_loop_inside_in_mutator" },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual([""]);
  });

  it("labels another unsupported block with its own text, not its children", () => {
    Blockly.serialization.blocks.append(
      {
        type: UNSUPPORTED_WITH_INPUT_TYPE,
        inputs: { VALUE: { block: { type: "math_number", fields: { NUM: 5 } } } },
      },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual(["convertir"]);
  });

  it("gives an empty label to a block whose fields only show symbols", () => {
    Blockly.serialization.blocks.append({ type: SYMBOLS_ONLY_TYPE }, workspace);

    expect(unsupportedLabels(workspace)).toEqual([""]);
  });

  it("labels a block whose text is only digits", () => {
    Blockly.serialization.blocks.append(
      { type: TYPED_TEXT_TYPE, fields: { TEXT: "42" } },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual(["42"]);
  });

  it("labels a block whose text is written in Arabic letters", () => {
    Blockly.serialization.blocks.append(
      { type: TYPED_TEXT_TYPE, fields: { TEXT: "مرحبا" } },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual(["مرحبا"]);
  });

  it("joins the several texts of a block with a space", () => {
    Blockly.serialization.blocks.append({ type: TWO_TEXTS_TYPE }, workspace);

    expect(unsupportedLabels(workspace)).toEqual(["a b"]);
  });

  it("cuts a long label to 40 characters ending with an ellipsis", () => {
    Blockly.serialization.blocks.append(
      { type: TYPED_TEXT_TYPE, fields: { TEXT: "a".repeat(60) } },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual([`${"a".repeat(39)}…`]);
  });

  it("keeps a label of exactly 40 characters whole", () => {
    Blockly.serialization.blocks.append(
      { type: TYPED_TEXT_TYPE, fields: { TEXT: "a".repeat(40) } },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual(["a".repeat(40)]);
  });

  it("does not split an emoji when cutting a long label", () => {
    Blockly.serialization.blocks.append(
      { type: TYPED_TEXT_TYPE, fields: { TEXT: `${"a".repeat(38)}😀😀😀` } },
      workspace,
    );

    expect(unsupportedLabels(workspace)).toEqual([`${"a".repeat(38)}😀…`]);
  });

  it("keeps the error text fallback of generateCode for the code panel", () => {
    Blockly.serialization.blocks.append({ type: UNSUPPORTED_TYPE }, workspace);

    expect(generateCode(workspace, "micropython")).toContain(
      "// Erreur de génération (micropython)",
    );
  });
});
