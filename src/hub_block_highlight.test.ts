import { describe, expect, it, vi } from "vitest";
import {
  HUB_UNSUPPORTED_CLASS,
  clearOnBlockEdit,
  markUnsupportedBlocks,
} from "./hub_block_highlight";

describe("clearOnBlockEdit", () => {
  it("clears on a block edit but not on a UI event", () => {
    let listener: ((event: { isUiEvent: boolean }) => void) | undefined;
    const workspace = {
      addChangeListener: (callback: (event: { isUiEvent: boolean }) => void) => {
        listener = callback;
      },
    };
    const clear = vi.fn();

    clearOnBlockEdit(workspace, clear);
    listener?.({ isUiEvent: true });
    expect(clear).not.toHaveBeenCalled();
    listener?.({ isUiEvent: false });

    expect(clear).toHaveBeenCalledTimes(1);
  });

  it("registers its listener on each workspace it is given", () => {
    const first = { addChangeListener: vi.fn() };
    const second = { addChangeListener: vi.fn() };

    clearOnBlockEdit(first, vi.fn());
    clearOnBlockEdit(second, vi.fn());

    expect(first.addChangeListener).toHaveBeenCalledTimes(1);
    expect(second.addChangeListener).toHaveBeenCalledTimes(1);
  });
});

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
