const MIN_LABEL_WIDTH = 80;
const TEXT_PADDING = 32;

export interface CategoryLabelWidthInput {
  readonly viewWidth: number;
  readonly sideMargin: number;
  /** Largeur de la barre de défilement verticale posée sur le bord droit du flyout. */
  readonly scrollbarWidth: number;
  readonly stroke: number;
  readonly textWidth: number;
}

/**
 * Largeur du badge de catégorie : marge identique des deux côtés, sans
 * passer sous la barre de défilement du flyout.
 */
export function computeCategoryLabelWidth(
  input: CategoryLabelWidthInput,
): number {
  const available =
    input.viewWidth - input.sideMargin * 2 - input.scrollbarWidth;
  return Math.max(
    input.textWidth + TEXT_PADDING,
    Math.max(MIN_LABEL_WIDTH, available),
  );
}
