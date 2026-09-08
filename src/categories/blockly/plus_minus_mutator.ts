/**
 * @packageDocumentation
 * @module BlocklyCategories.PlusMinusMutator
 * @description Shared +/- mutator helpers (countable parts + safe registration).
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { createPlusField } from "@blockly/block-plus-minus/src/field_plus";
import { createMinusField } from "@blockly/block-plus-minus/src/field_minus";

export { createPlusField, createMinusField };

/** Block shape used by countable +/- mutators after mixin. */
export type CountablePlusMinusBlock = Blockly.Block & {
  updateShape_: (targetCount: number) => void;
  addPart_: () => void;
  removePart_: () => void;
  updateMinus_: () => void;
  plus: () => void;
  minus: () => void;
};

type CountBag = Blockly.Block & Record<string, unknown>;

const asBag = (block: CountablePlusMinusBlock): CountBag =>
  block as unknown as CountBag;

const getCount = (block: CountablePlusMinusBlock, prop: string): number =>
  Number(asBag(block)[prop] ?? 0);

const setCount = (
  block: CountablePlusMinusBlock,
  prop: string,
  value: number,
): void => {
  asBag(block)[prop] = value;
};

const getTopInput = (
  block: CountablePlusMinusBlock,
  prop: string,
): Blockly.Input | null =>
  (asBag(block)[prop] as Blockly.Input | null | undefined) ?? null;

const setTopInput = (
  block: CountablePlusMinusBlock,
  prop: string,
  input: Blockly.Input | null,
): void => {
  asBag(block)[prop] = input;
};

export type PartListPlusMinusMutatorOptions = {
  /** Block property holding the part count (e.g. `itemCount_`, `loopCount_`). */
  countProperty: string;
  /** Property holding the first part input (e.g. `topInput_`). */
  topInputProperty: string;
  /** XML mutation attribute name (e.g. `items`, `loops`). */
  xmlAttribute: string;
  /** `saveExtraState` / `loadExtraState` key (e.g. `itemCount`, `loopCount`). */
  stateKey: string;
  /**
   * Input name for part at index (e.g. `ADD0`, `LOOP1`).
   * @param index - Zero-based part index.
   */
  partInputName: (index: number) => string;
  /** Lowest allowed count after minus (0 for lists, 1 for libre loops). */
  minCount?: number;
  /** Placeholder input removed when the first part is added. */
  emptyInputName?: string;
  /**
   * Clamp loaded counts (e.g. libre forces at least 1).
   * @param raw - Parsed count from XML / state.
   */
  normalizeLoadedCount?: (raw: number) => number;
  /**
   * Create the first part (index 0); must include the PLUS field.
   * @param block - Mutator host block.
   * @returns The top input used for PLUS/MINUS fields.
   */
  appendFirstPart: (block: CountablePlusMinusBlock) => Blockly.Input;
  /**
   * Create a subsequent part at `index` (current count before increment).
   * @param block - Mutator host block.
   * @param index - Next part index.
   */
  appendExtraPart: (block: CountablePlusMinusBlock, index: number) => void;
  /**
   * Rebuild empty UI when count returns to 0 (optional).
   * @param block - Mutator host block.
   * @returns New top input, or null.
   */
  appendEmptyState?: (block: CountablePlusMinusBlock) => Blockly.Input | null;
  /**
   * Called after shape updates (typing hooks, etc.).
   * @param block - Mutator host block.
   */
  afterUpdate?: (block: CountablePlusMinusBlock) => void;
};

/**
 * Registers a mutator only if the name is free (safe under HMR / double boot).
 * @param mutatorName - Extension registry name.
 * @param mutator - Mixin object.
 * @param helper - Optional init helper applied when the mutator is attached.
 */
export const registerMutatorOnce = (
  mutatorName: string,
  mutator: object,
  helper?: (this: Blockly.Block) => void,
): void => {
  if (Blockly.Extensions.isRegistered(mutatorName)) {
    return;
  }
  Blockly.Extensions.registerMutator(mutatorName, mutator, helper);
};

/**
 * Builds a countable +/- mutator mixin (array lists, libre loops, …).
 * @param options - Part creation / count serialization config.
 * @returns Mutator mixin for {@link registerMutatorOnce}.
 */
export const createPartListPlusMinusMutator = (
  options: PartListPlusMinusMutatorOptions,
): object => {
  const {
    countProperty,
    topInputProperty,
    xmlAttribute,
    stateKey,
    partInputName,
    minCount = 0,
    emptyInputName,
    normalizeLoadedCount = (raw) => raw,
    appendFirstPart,
    appendExtraPart,
    appendEmptyState,
    afterUpdate,
  } = options;

  return {
    [countProperty]: 0,
    [topInputProperty]: null as Blockly.Input | null,

    mutationToDom(this: CountablePlusMinusBlock): Element {
      const container = Blockly.utils.xml.createElement("mutation");
      container.setAttribute(
        xmlAttribute,
        String(getCount(this, countProperty)),
      );
      return container;
    },

    domToMutation(this: CountablePlusMinusBlock, xmlElement: Element) {
      const raw = Number(xmlElement.getAttribute(xmlAttribute) || 0);
      this.updateShape_(normalizeLoadedCount(raw));
    },

    saveExtraState(this: CountablePlusMinusBlock) {
      return { [stateKey]: getCount(this, countProperty) };
    },

    loadExtraState(
      this: CountablePlusMinusBlock,
      state: Record<string, number | undefined>,
    ) {
      const raw = state[stateKey] ?? 0;
      this.updateShape_(normalizeLoadedCount(Number(raw)));
    },

    updateShape_(this: CountablePlusMinusBlock, targetCount: number) {
      while (getCount(this, countProperty) < targetCount) {
        this.addPart_();
      }
      while (getCount(this, countProperty) > targetCount) {
        this.removePart_();
      }
      this.updateMinus_();
      afterUpdate?.(this);
    },

    plus(this: CountablePlusMinusBlock) {
      this.addPart_();
      this.updateMinus_();
      afterUpdate?.(this);
    },

    minus(this: CountablePlusMinusBlock) {
      if (getCount(this, countProperty) <= minCount) {
        return;
      }
      this.removePart_();
      this.updateMinus_();
      afterUpdate?.(this);
    },

    addPart_(this: CountablePlusMinusBlock) {
      const count = getCount(this, countProperty);
      if (count === 0) {
        if (emptyInputName && this.getInput(emptyInputName)) {
          this.removeInput(emptyInputName);
        }
        setTopInput(this, topInputProperty, appendFirstPart(this));
      } else {
        appendExtraPart(this, count);
      }
      setCount(this, countProperty, count + 1);
    },

    removePart_(this: CountablePlusMinusBlock) {
      const next = getCount(this, countProperty) - 1;
      setCount(this, countProperty, next);
      this.removeInput(partInputName(next));
      if (next === 0) {
        if (appendEmptyState) {
          setTopInput(this, topInputProperty, appendEmptyState(this));
        } else {
          setTopInput(this, topInputProperty, null);
        }
      }
    },

    updateMinus_(this: CountablePlusMinusBlock) {
      const count = getCount(this, countProperty);
      const minusField = this.getField("MINUS");
      const top = getTopInput(this, topInputProperty);
      if (!minusField && count > minCount) {
        top?.insertFieldAt(1, createMinusField(), "MINUS");
      } else if (minusField && count <= minCount) {
        top?.removeField("MINUS");
      }
    },
  };
};
