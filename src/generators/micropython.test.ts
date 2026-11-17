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
import { micropythonGenerator } from "./micropython";

type BlockState = Blockly.serialization.blocks.State;

const delayMs = (milliseconds: number): BlockState => ({
  type: "board_base_time_delay",
  inputs: {
    DELAY_TIME: {
      block: { type: "math_number", fields: { NUM: milliseconds } },
    },
  },
});

const digitalWriteHigh = (pin: string): BlockState => ({
  type: "board_base_inout_digital_write",
  fields: { PIN: pin, STAT: "HIGH" },
});

const ifTrueThenDelay: BlockState = {
  type: "controls_if",
  inputs: {
    IF0: { block: { type: "logic_boolean", fields: { BOOL: "TRUE" } } },
    DO0: { block: delayMs(5) },
  },
};

const setupLoop = (bodies: {
  setup?: BlockState;
  loop?: BlockState;
}): BlockState => ({
  type: "board_base_setup_loop",
  inputs: {
    ...(bodies.setup && { SETUP: { block: bodies.setup } }),
    ...(bodies.loop && { LOOP: { block: bodies.loop } }),
  },
});

describe("MicroPython generator", () => {
  let workspace: Blockly.Workspace;

  // The header carries the generation time, so it is dropped before comparing.
  const generate = (program: BlockState): string[] => {
    Blockly.serialization.blocks.append(program, workspace);
    return micropythonGenerator
      .workspaceToCode(workspace)
      .split("\n")
      .slice(3);
  };

  beforeAll(() => {
    // µcBlockly reads the selected board from a #boardMenu element.
    vi.stubGlobal("document", { getElementById: () => null });
    registerUcBlocklyKernel();
  });

  beforeEach(() => {
    workspace = new Blockly.Workspace();
  });

  afterEach(() => {
    workspace.dispose();
  });

  it("returns nothing for an empty workspace", () => {
    expect(micropythonGenerator.workspaceToCode(workspace)).toBe("");
  });

  it("emits an idle loop for an empty setup/loop block", () => {
    expect(generate(setupLoop({}))).toEqual([
      "# --- setup ---",
      "",
      "# --- loop ---",
      "while True:",
      "  pass",
      "",
    ]);
  });

  // Indented setup lines are an IndentationError at module level.
  it("writes setup statements without indent and loop statements under while", () => {
    expect(generate(setupLoop({ setup: delayMs(100), loop: delayMs(500) }))).toEqual([
      "import time",
      "",
      "# --- setup ---",
      "time.sleep_ms(int(100))",
      "",
      "# --- loop ---",
      "while True:",
      "  time.sleep_ms(int(500))",
      "",
    ]);
  });

  const nestedInSetupAndLoop = [
    "import time",
    "",
    "# --- setup ---",
    "if True:",
    "  time.sleep_ms(int(5))",
    "",
    "# --- loop ---",
    "while True:",
    "  if True:",
    "    time.sleep_ms(int(5))",
    "",
  ];

  it("keeps the indent of nested statements", () => {
    expect(
      generate(setupLoop({ setup: ifTrueThenDelay, loop: ifTrueThenDelay })),
    ).toEqual(nestedInSetupAndLoop);
  });

  it("generates the same code from separate setup and loop blocks", () => {
    generate({
      type: "board_base_setup",
      inputs: { SETUP: { block: ifTrueThenDelay } },
    });

    expect(
      generate({
        type: "board_base_loop",
        inputs: { LOOP: { block: ifTrueThenDelay } },
      }),
    ).toEqual(nestedInSetupAndLoop);
  });

  it("declares the pin in setup before a digital write", () => {
    expect(generate(setupLoop({ loop: digitalWriteHigh("2") }))).toEqual([
      "from machine import Pin",
      "",
      "# --- setup ---",
      "pin_2 = Pin(2, Pin.OUT)",
      "",
      "# --- loop ---",
      "while True:",
      "  pin_2.value(1)",
      "",
    ]);
  });

  // Reading an input the block does not define throws, which blanks the whole output.
  const boardBlockTypes = Object.keys(micropythonGenerator.forBlock).filter((type) =>
    type.startsWith("board_"),
  );

  it.each(boardBlockTypes)("generates %s without throwing", (type) => {
    micropythonGenerator.init(workspace);
    expect(() => micropythonGenerator.blockToCode(workspace.newBlock(type))).not.toThrow();
  });
});
