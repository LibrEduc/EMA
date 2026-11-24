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
// Like libre_start: no field text, so Blockly's toString() only returns "???".
const UNNAMED_TYPE = "ema_test_unnamed";

const emptySetupLoop: BlockState = { type: "board_base_setup_loop" };

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
      { id: block.id, label: "bloc inconnu" },
    ]);
  });

  it("falls back to the block type when the block has no readable label", () => {
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
      { id: block.id, label: UNNAMED_TYPE },
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

  it("keeps the error text fallback of generateCode for the code panel", () => {
    Blockly.serialization.blocks.append({ type: UNSUPPORTED_TYPE }, workspace);

    expect(generateCode(workspace, "micropython")).toContain(
      "// Erreur de génération (micropython)",
    );
  });
});
