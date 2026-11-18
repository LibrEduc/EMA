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

const number = (value: number): BlockState => ({
  type: "math_number",
  fields: { NUM: value },
});

const sqrtOf = (value: number): BlockState => ({
  type: "math_single",
  fields: { OP: "ROOT" },
  inputs: { NUM: { block: number(value) } },
});

const delayOf = (expression: BlockState): BlockState => ({
  type: "board_base_time_delay",
  inputs: { DELAY_TIME: { block: expression } },
});

const chain = (first: BlockState, second: BlockState): BlockState => ({
  ...first,
  next: { block: second },
});

const loopOf = (body: BlockState): BlockState => ({
  type: "board_base_setup_loop",
  inputs: { LOOP: { block: body } },
});

const blinkDefinition: BlockState = {
  type: "procedures_defnoreturn",
  fields: { NAME: "blink" },
  inputs: { STACK: { block: delayOf(number(100)) } },
};

const callBlink: BlockState = {
  type: "procedures_callnoreturn",
  extraState: { name: "blink" },
};

describe("MicroPython generator definitions", () => {
  let workspace: Blockly.Workspace;

  const generate = (...programs: BlockState[]): string[] => {
    for (const program of programs) {
      Blockly.serialization.blocks.append(program, workspace);
    }
    return micropythonGenerator
      .workspaceToCode(workspace)
      .split("\n")
      .slice(3);
  };

  beforeAll(() => {
    vi.stubGlobal("document", { getElementById: () => null });
    registerUcBlocklyKernel();
  });

  beforeEach(() => {
    workspace = new Blockly.Workspace();
  });

  afterEach(() => {
    workspace.dispose();
  });

  it("imports math for a square root", () => {
    const lines = generate(loopOf(delayOf(sqrtOf(9))));
    expect(lines.slice(0, 3)).toEqual(["import math", "import time", ""]);
    expect(lines.join("\n")).toContain("math.sqrt(9)");
  });

  it("does not repeat an import", () => {
    const lines = generate(
      loopOf(chain(delayOf(sqrtOf(9)), delayOf(sqrtOf(16)))),
    );
    expect(lines.filter((line) => line === "import math")).toHaveLength(1);
  });

  it("defines a function before the loop that calls it", () => {
    const lines = generate(blinkDefinition, loopOf(callBlink));
    const definition = lines.indexOf("def blink():");
    expect(definition).toBeGreaterThanOrEqual(0);
    expect(definition).toBeLessThan(lines.indexOf("while True:"));
    expect(lines).toContain("  blink()");
  });

  it("keeps a function when there is no setup or loop", () => {
    const lines = generate({
      type: "procedures_defnoreturn",
      fields: { NAME: "blink" },
    });
    expect(lines).toContain("def blink():");
    expect(lines).not.toContain("while True:");
  });

  it("adds to a variable with +=", () => {
    workspace.getVariableMap().createVariable("score", "", "v1");
    const change: BlockState = {
      type: "math_change",
      inputs: {
        VAR: { block: { type: "variables_get", fields: { VAR: { id: "v1" } } } },
        DELTA: { block: number(1) },
      },
    };
    const output = generate(loopOf(change)).join("\n");
    expect(output).toContain("score = None\n");
    expect(output).toContain("\n  score += 1\n");
    expect(output).not.toMatch(/unnamed|Number|isinstance/);
  });

  it("orders imports, variables and functions before setup", () => {
    workspace.getVariableMap().createVariable("score", "", "v1");
    const setScoreToZero: BlockState = {
      type: "variables_set",
      fields: { VAR: { id: "v1" } },
      inputs: { VALUE: { block: number(0) } },
      next: { block: callBlink },
    };
    const lines = generate(blinkDefinition, {
      type: "board_base_setup_loop",
      inputs: {
        SETUP: { block: setScoreToZero },
        LOOP: { block: delayOf(number(5)) },
      },
    });
    const order = ["import time", "score = None", "def blink():", "# --- setup ---"];
    const positions = order.map((line) => lines.indexOf(line));
    expect(positions).not.toContain(-1);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(lines.slice(positions[3])).toContain("blink()");
  });

  it("sets up pins before a setup that calls a function using them", () => {
    const lines = generate(
      {
        type: "board_base_setup_loop",
        x: 0,
        y: 0,
        inputs: {
          SETUP: { block: { type: "procedures_callnoreturn", extraState: { name: "init" } } },
        },
      },
      {
        type: "procedures_defnoreturn",
        x: 0,
        y: 300,
        fields: { NAME: "init" },
        inputs: {
          STACK: {
            block: {
              type: "board_base_inout_digital_write",
              fields: { PIN: "13", STAT: "HIGH" },
            },
          },
        },
      },
    );
    const pinSetup = lines.indexOf("pin_13 = Pin(13, Pin.OUT)");
    expect(pinSetup).toBeGreaterThan(lines.indexOf("# --- setup ---"));
    expect(pinSetup).toBeLessThan(lines.indexOf("init()"));
  });

  describe("a pin chosen by a variable", () => {
    const setBrocheTo5: BlockState = {
      type: "variables_set",
      fields: { VAR: { id: "v1" } },
      inputs: { VALUE: { block: number(5) } },
    };
    const printBrocheRead: BlockState = {
      type: "text_print",
      inputs: {
        TEXT: {
          block: {
            type: "board_base_inout_digital_read_pin",
            inputs: {
              PIN: { block: { type: "variables_get", fields: { VAR: { id: "v1" } } } },
            },
          },
        },
      },
    };

    beforeEach(() => {
      workspace.getVariableMap().createVariable("broche", "", "v1");
    });

    // A setup line built from the variable would run before or after the
    // student's setup, and either order breaks one of these two programs.
    it("is read where the loop reads it", () => {
      const lines = generate({
        type: "board_base_setup_loop",
        inputs: { SETUP: { block: setBrocheTo5 }, LOOP: { block: printBrocheRead } },
      });
      expect(lines).toContain("  print(Pin(broche, Pin.IN).value())");
      expect(lines.join("\n")).not.toContain("pin_dyn");
    });

    it("is read where the setup reads it", () => {
      const lines = generate({
        type: "board_base_setup_loop",
        inputs: { SETUP: { block: chain(setBrocheTo5, printBrocheRead) } },
      });
      const read = lines.indexOf("print(Pin(broche, Pin.IN).value())");
      expect(read).toBeGreaterThan(lines.indexOf("broche = 5"));
      expect(lines.join("\n")).not.toContain("pin_dyn");
    });
  });

  it("renames a variable that would hide the time module", () => {
    workspace.getVariableMap().createVariable("time", "", "v1");
    const printTime: BlockState = {
      type: "text_print",
      inputs: {
        TEXT: { block: { type: "variables_get", fields: { VAR: { id: "v1" } } } },
      },
    };
    const lines = generate(loopOf(chain(printTime, delayOf(number(5)))));
    expect(lines).toContain("  print(time2)");
    expect(lines).toContain("  time.sleep_ms(int(5))");
  });

  it("keeps a student variable named led apart from the built-in LED", () => {
    workspace.getVariableMap().createVariable("led", "", "v1");
    const ledOn: BlockState = { type: "board_base_inout_buildin_led", fields: { STAT: "HIGH" } };
    const printLed: BlockState = {
      type: "text_print",
      inputs: {
        TEXT: { block: { type: "variables_get", fields: { VAR: { id: "v1" } } } },
      },
    };
    const lines = generate(loopOf(chain(ledOn, printLed)));
    expect(lines.some((line) => line.startsWith("builtin_led = Pin("))).toBe(true);
    expect(lines).toContain("  builtin_led.value(1)");
    expect(lines).toContain("  print(led)");
    expect(lines.some((line) => line.startsWith("led = Pin("))).toBe(false);
  });

  it("checks numbers without the numbers module, absent from MicroPython", () => {
    const isPrime: BlockState = {
      type: "math_number_property",
      fields: { PROPERTY: "PRIME" },
      inputs: { NUMBER_TO_CHECK: { block: number(7) } },
    };
    const lines = generate(
      loopOf({ type: "text_print", inputs: { TEXT: { block: isPrime } } }),
    );
    expect(lines).not.toContain("from numbers import Number");
    expect(lines).toContain("Number = (int, float)");
    expect(lines.indexOf("Number = (int, float)")).toBeLessThan(
      lines.indexOf("def math_isPrime(n):"),
    );
  });

  it("emits nothing for a math_change without a variable", () => {
    const change: BlockState = {
      type: "math_change",
      inputs: { DELTA: { block: number(1) } },
    };
    expect(generate(loopOf(change)).join("\n")).not.toContain("+=");
  });
});
