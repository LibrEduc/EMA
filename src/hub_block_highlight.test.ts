import { describe, expect, it, vi } from "vitest";
import {
  HUB_UNSUPPORTED_CLASS,
  markUnsupportedBlocks,
} from "./hub_block_highlight";

const fakeBlock = () => {
  const classList = { add: vi.fn(), remove: vi.fn() };
  return { classList, block: { getSvgRoot: () => ({ classList }) } };
};

describe("markUnsupportedBlocks (contour rouge)", () => {
  it("adds the red outline class to each block and centers the first one", () => {
    const first = fakeBlock();
    const second = fakeBlock();
    const blocks: Record<string, unknown> = { a: first.block, b: second.block };
    const workspace = {
      getBlockById: (id: string) => blocks[id] ?? null,
      centerOnBlock: vi.fn(),
    };

    markUnsupportedBlocks(workspace, ["a", "b"]);

    expect(first.classList.add).toHaveBeenCalledWith(HUB_UNSUPPORTED_CLASS);
    expect(second.classList.add).toHaveBeenCalledWith(HUB_UNSUPPORTED_CLASS);
    expect(workspace.centerOnBlock).toHaveBeenCalledTimes(1);
    expect(workspace.centerOnBlock).toHaveBeenCalledWith("a");
  });

  it("returns a function that removes the outline again", () => {
    const first = fakeBlock();
    const workspace = {
      getBlockById: () => first.block,
      centerOnBlock: vi.fn(),
    };

    const clear = markUnsupportedBlocks(workspace, ["a"]);
    clear();

    expect(first.classList.remove).toHaveBeenCalledWith(HUB_UNSUPPORTED_CLASS);
  });

  it("skips unknown ids and does nothing for an empty list", () => {
    const workspace = { getBlockById: () => null, centerOnBlock: vi.fn() };

    expect(() => markUnsupportedBlocks(workspace, ["missing"])).not.toThrow();
    markUnsupportedBlocks(workspace, []);

    expect(workspace.centerOnBlock).not.toHaveBeenCalled();
  });
});
