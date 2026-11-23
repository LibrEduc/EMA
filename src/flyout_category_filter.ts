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

function isLabel(item: FlyoutContentItem | undefined): boolean {
  return typeof item?.kind === "string" && item.kind.toLowerCase() === "label";
}

/**
 * Définition à afficher pour la catégorie sélectionnée. Si elle est absente ou
 * sans bloc (ex. « Recherche » à l'init), on prend la 1re catégorie avec blocs ;
 * sans aucune, on garde la définition complète.
 */
export function resolveFlyoutDefinition<T extends FlyoutContentItem>(
  contents: readonly T[],
  categoryName: string,
): T[] {
  const own = sliceFlyoutContentsForCategory(contents, categoryName);
  if (own.length > 1) {
    return own;
  }
  for (let i = 0; i < contents.length; i++) {
    if (!isLabel(contents[i])) {
      continue;
    }
    const text = contents[i].text;
    const section =
      typeof text === "string"
        ? sliceFlyoutContentsForCategory(contents, text)
        : [];
    if (section.length > 1) {
      return section;
    }
  }
  return [...contents];
}
