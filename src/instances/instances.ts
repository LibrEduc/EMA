/**
 * @packageDocumentation
 * @module Instances
 * @description Named object instances (Servo, I2C, …) shared across config/usage blocks.
 * @remarks
 * Port of Blockly@rduino / Ardublockly `Blockly.Instances` for Blockly 13.
 * Names are reconstructed by scanning `FieldInstance` fields on the workspace
 * (no separate store) — compatible with save/load JSON.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import * as Blockly from "blockly";

/** Category token separating instance names from variables / procedures. */
export const INSTANCE_NAME_TYPE = "INSTANCE";

/** Minimal surface of FieldInstance used while scanning (avoids circular imports). */
export interface InstanceFieldLike {
  getInstanceTypeValue(instanceType: string): string | undefined;
  getValue(): string | null;
  getText(): string;
  setValue(newValue: string): void;
}

type WorkspaceLike = Blockly.Workspace;

function assertWorkspace(workspace: WorkspaceLike | null | undefined): WorkspaceLike {
  if (!workspace || typeof workspace.getAllBlocks !== "function") {
    throw new Error("Not a valid Workspace");
  }
  return workspace;
}

function allVariableNames(workspace: WorkspaceLike): string[] {
  return workspace
    .getVariableMap()
    .getAllVariables()
    .map((variable) => variable.getName());
}

/**
 * Si `name` est déjà une variable du workspace, renvoie ce nom ; sinon `null`.
 * Comparaison insensible à la casse (comme Blockly).
 */
export function findVariableNameCollision(
  name: string,
  workspace: WorkspaceLike,
): string | null {
  const lower = name.toLowerCase();
  for (const variableName of allVariableNames(workspace)) {
    if (variableName.toLowerCase() === lower) {
      return variableName;
    }
  }
  return null;
}

/**
 * Si `name` est déjà une instance du workspace, renvoie ce nom ; sinon `null`.
 * Comparaison insensible à la casse.
 */
export function findInstanceNameCollision(
  name: string,
  workspace: WorkspaceLike,
): string | null {
  const lower = name.toLowerCase();
  for (const instanceName of allInstances(workspace)) {
    if (instanceName.toLowerCase() === lower) {
      return instanceName;
    }
  }
  return null;
}

/** True if the field exposes FieldInstance APIs. */
export function isInstanceField(
  field: Blockly.Field,
): field is Blockly.Field & InstanceFieldLike {
  const candidate = field as Blockly.Field & Partial<InstanceFieldLike>;
  return typeof candidate.getInstanceTypeValue === "function";
}

/**
 * Instance names referenced by this block's FieldInstance fields.
 * @param opt_instanceType - If set, only fields of that type.
 */
export function getInstancesFromBlock(
  block: Blockly.Block,
  opt_instanceType?: string,
): string[] {
  const names: string[] = [];
  for (const input of block.inputList) {
    for (const field of input.fieldRow) {
      if (!isInstanceField(field)) {
        continue;
      }
      const value = opt_instanceType
        ? field.getInstanceTypeValue(opt_instanceType)
        : field.getValue();
      if (value) {
        names.push(value);
      }
    }
  }
  return names;
}

/** Rename matching FieldInstance fields on a single block. */
export function renameInstancesOnBlock(
  block: Blockly.Block,
  oldName: string,
  newName: string,
  instanceType: string,
): void {
  for (const input of block.inputList) {
    for (const field of input.fieldRow) {
      if (!isInstanceField(field)) {
        continue;
      }
      const current = field.getInstanceTypeValue(instanceType);
      if (current && Blockly.Names.equals(oldName, current)) {
        field.setValue(newName);
      }
    }
  }
}

/**
 * Collect every instance name of the given type (or all types if omitted).
 */
export function allInstancesOf(
  instanceType: string | undefined,
  workspace: WorkspaceLike,
): string[] {
  const ws = assertWorkspace(workspace);
  const instanceHash = Object.create(null) as Record<string, string>;
  for (const block of ws.getAllBlocks(false)) {
    for (const instanceName of getInstancesFromBlock(block, instanceType)) {
      if (instanceName) {
        instanceHash[instanceName.toLowerCase()] = instanceName;
      }
    }
  }
  return Object.keys(instanceHash).map((key) => instanceHash[key]);
}

/** All instance names of every type. */
export function allInstances(workspace: WorkspaceLike): string[] {
  return allInstancesOf(undefined, workspace);
}

/** First instance name of a given type, or undefined. */
export function getAnyInstanceOf(
  instanceType: string,
  workspace: WorkspaceLike,
): string | undefined {
  const ws = assertWorkspace(workspace);
  for (const block of ws.getAllBlocks(false)) {
    const names = getInstancesFromBlock(block, instanceType);
    if (names.length) {
      return names[0];
    }
  }
  return undefined;
}

/**
 * True if another block (not `block`) already references this instance name.
 * Used by usage blocks to warn when no config/attach block exists.
 */
export function isInstancePresent(
  instanceName: string,
  instanceType: string,
  block: Blockly.Block,
): boolean {
  const workspace = block.workspace;
  if (!workspace?.getAllBlocks) {
    throw new Error("Not a valid block");
  }
  for (const other of workspace.getAllBlocks(false)) {
    if (other === block) {
      continue;
    }
    if (getInstancesFromBlock(other, instanceType).includes(instanceName)) {
      return true;
    }
  }
  return false;
}

/** Rename every matching FieldInstance on the workspace. */
export function renameInstance(
  oldName: string,
  newName: string,
  instanceType: string,
  workspace: WorkspaceLike,
): void {
  const ws = assertWorkspace(workspace);
  Blockly.Events.setGroup(true);
  try {
    for (const block of ws.getAllBlocks(false)) {
      renameInstancesOnBlock(block, oldName, newName, instanceType);
    }
  } finally {
    Blockly.Events.setGroup(false);
  }
}

/**
 * Generate a short unique name unused by variables or instances
 * (`i`…`z`, then `i2`…).
 */
export function generateUniqueName(workspace: WorkspaceLike): string {
  const ws = assertWorkspace(workspace);
  const combinedList = allVariableNames(ws).concat(allInstances(ws));
  if (!combinedList.length) {
    return "i";
  }
  const letters = "ijkmnopqrstuvwxyzabcdefgh"; // no 'l'
  let nameSuffix = 1;
  let letterIndex = 0;
  let potName = letters.charAt(letterIndex);
  for (;;) {
    const inUse = combinedList.some(
      (name) => name.toLowerCase() === potName.toLowerCase(),
    );
    if (!inUse) {
      return potName;
    }
    letterIndex += 1;
    if (letterIndex === letters.length) {
      letterIndex = 0;
      nameSuffix += 1;
    }
    potName = letters.charAt(letterIndex);
    if (nameSuffix > 1) {
      potName += String(nameSuffix);
    }
  }
}

function appendToName(instanceName: string, nameList: string[]): string {
  if (!instanceName) {
    return "i";
  }
  let newName = instanceName;
  let nameSuffix = 1;
  const lowerSet = new Set(nameList.map((n) => n.toLowerCase()));
  while (lowerSet.has(newName.toLowerCase())) {
    newName = `${instanceName}_${nameSuffix++}`;
  }
  return newName;
}

/** Make `instanceName` unique among variables + instances on the workspace. */
export function convertToUniqueName(
  instanceName: string,
  workspace: WorkspaceLike,
): string {
  const ws = assertWorkspace(workspace);
  const combinedList = allVariableNames(ws).concat(allInstances(ws));
  if (!instanceName) {
    return generateUniqueName(ws);
  }
  return appendToName(instanceName, combinedList);
}

/**
 * Make `instanceName` unique, ignoring fields on `block` itself
 * (used when dropping a uniqueName FieldInstance from the flyout).
 */
export function convertToUniqueNameBlock(
  instanceName: string,
  block: Blockly.Block,
): string {
  const workspace = block.workspace;
  if (!workspace) {
    throw new Error("Not a valid Workspace");
  }
  const instanceHash = Object.create(null) as Record<string, string>;
  for (const other of workspace.getAllBlocks(false)) {
    if (other === block) {
      continue;
    }
    for (const name of getInstancesFromBlock(other)) {
      if (name) {
        instanceHash[name.toLowerCase()] = name;
      }
    }
  }
  const instanceList = Object.keys(instanceHash).map((k) => instanceHash[k]);
  const combinedList = allVariableNames(workspace).concat(instanceList);
  if (!instanceName) {
    return generateUniqueName(workspace);
  }
  return appendToName(instanceName, combinedList);
}

/** Namespace mirror of the historical `Blockly.Instances` API. */
export const Instances = {
  NAME_TYPE: INSTANCE_NAME_TYPE,
  allInstancesOf,
  allInstances,
  getAnyInstanceOf,
  isInstancePresent,
  renameInstance,
  generateUniqueName,
  convertToUniqueName,
  convertToUniqueNameBlock,
  getInstancesFromBlock,
  renameInstancesOnBlock,
  findVariableNameCollision,
  findInstanceNameCollision,
} as const;
