export const HUB_UNSUPPORTED_CLASS = "ema-hub-unsupported";

interface ClassListLike {
  add(name: string): void;
  remove(name: string): void;
}

interface SvgRootBlock {
  getSvgRoot(): { classList: ClassListLike } | null;
}

/** The part of a Blockly workspace this module needs (kept minimal for tests). */
export interface HighlightWorkspace {
  getBlockById(id: string): unknown;
  centerOnBlock(id: string): void;
}

function hasSvgRoot(value: unknown): value is SvgRootBlock {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { getSvgRoot?: unknown }).getSvgRoot === "function"
  );
}

/**
 * Outlines the given blocks in red and centers the first one.
 * Returns a function that removes the outline again.
 */
export function markUnsupportedBlocks(
  workspace: HighlightWorkspace,
  blockIds: ReadonlyArray<string>,
): () => void {
  const marked: ClassListLike[] = [];
  for (const id of blockIds) {
    const block = workspace.getBlockById(id);
    const root = hasSvgRoot(block) ? block.getSvgRoot() : null;
    if (root) {
      root.classList.add(HUB_UNSUPPORTED_CLASS);
      marked.push(root.classList);
    }
  }
  const [firstId] = blockIds;
  if (marked.length > 0 && firstId !== undefined) {
    workspace.centerOnBlock(firstId);
  }
  return () => {
    for (const classList of marked) {
      classList.remove(HUB_UNSUPPORTED_CLASS);
    }
  };
}

/** The part of a Blockly workspace needed to react to block edits. */
export interface ChangeWorkspace {
  addChangeListener(callback: (event: { readonly isUiEvent: boolean }) => void): unknown;
}

/**
 * Calls `clear` on every block edit (not on scrolling or selection).
 * Must be called for each new workspace: a language change rebuilds it.
 */
export function clearOnBlockEdit(
  workspace: ChangeWorkspace,
  clear: () => void,
): void {
  workspace.addChangeListener((event) => {
    if (!event.isUiEvent) {
      clear();
    }
  });
}
