import { describe, expect, it } from "vitest";
import { withoutBoardCategory } from "./board_config";

describe("withoutBoardCategory", () => {
  const toolbox = {
    kind: "categoryToolbox",
    contents: [
      { kind: "category", name: "Libre", contents: [{ kind: "block", type: "a" }] },
      { kind: "sep" },
      {
        kind: "category",
        name: "Carte : arduino_uno",
        categorystyle: "board_category",
        contents: [{ kind: "block", type: "board_x" }],
      },
      { kind: "category", name: "CAT_BOARD", contents: [{ kind: "block", type: "board_y" }] },
      { kind: "category", name: "Logique", contents: [] },
    ],
  };

  it("removes the board category from the rail in single-board mode, keeps the others, does not mutate the input", () => {
    const snapshot = structuredClone(toolbox);
    const result = withoutBoardCategory(toolbox as never) as typeof toolbox;

    expect(result.contents.map((c) => (c as { name?: string }).name)).toEqual([
      "Libre",
      undefined,
      "Logique",
    ]);
    expect(toolbox).toEqual(snapshot);
  });
});
