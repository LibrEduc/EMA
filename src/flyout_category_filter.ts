export interface FlyoutContentItem {
  kind?: string;
  text?: string;
  [key: string]: unknown;
}

/**
 * Extracts only the label and items belonging to `categoryName` from a flat
 * continuous flyout definition array.
 */
export function sliceFlyoutContentsForCategory<T extends FlyoutContentItem>(
  contents: readonly T[],
  categoryName: string,
): T[] {
  const target = categoryName.trim().toLowerCase();
  if (!target || contents.length === 0) {
    return [];
  }

  let startIdx = -1;
  for (let i = 0; i < contents.length; i++) {
    const item = contents[i];
    if (
      typeof item?.kind === "string" &&
      item.kind.toLowerCase() === "label" &&
      typeof item.text === "string" &&
      item.text.trim().toLowerCase() === target
    ) {
      startIdx = i;
      break;
    }
  }

  if (startIdx === -1) {
    return [];
  }

  let endIdx = contents.length;
  for (let i = startIdx + 1; i < contents.length; i++) {
    const item = contents[i];
    if (typeof item?.kind === "string" && item.kind.toLowerCase() === "label") {
      endIdx = i;
      break;
    }
  }

  return contents.slice(startIdx, endIdx);
}
