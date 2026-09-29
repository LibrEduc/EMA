/**
 * @packageDocumentation
 * @module Instances.FieldInstance
 * @description Dropdown field for named instances (Servo, I2C, …) — Blockly 13 port of Ardublockly FieldInstance.
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";
import { getBlocklyMsgOr } from "../categories/blockly/shared";
import {
  allInstancesOf,
  convertToUniqueNameBlock,
  findVariableNameCollision,
  generateUniqueName,
  getAnyInstanceOf,
  renameInstance,
} from "./instances";

type MenuOption = Blockly.MenuOption;
type FieldDropdownValidator = Blockly.FieldDropdownValidator;

export interface FieldInstanceConfig extends Blockly.FieldConfig {
  instanceType?: string;
  instanceName?: string | null;
  uniqueName?: boolean;
  lockNew?: boolean;
  lockRename?: boolean;
}

export interface FieldInstanceFromJsonConfig extends FieldInstanceConfig {
  instanceType: string;
}

type EditDropdownData = (options: MenuOption[]) => MenuOption[];

/**
 * Dropdown listing workspace instances of a given type, plus rename / new.
 */
export class FieldInstance extends Blockly.FieldDropdown {
  private instanceType_ = "";
  private uniqueName_ = false;
  private lockNew_ = false;
  private lockRename_ = false;
  private editDropdownData: EditDropdownData | null = null;
  private userValidator_: FieldDropdownValidator | null = null;

  /**
   * @param instanceType - Logical type key (`Servo`, `I2C`, …).
   * @param instanceName - Default name, or null to auto-generate.
   * @param uniqueName - Force a unique name when the block leaves the flyout.
   * @param lockNew - Hide « New instance ».
   * @param lockRename - Hide « Rename instance ».
   * @param editDropdownData - Optional post-process of menu options.
   * @param validator - Extra validator (composed with rename/new handling).
   * @param config - Blockly field config.
   */
  constructor(
    instanceType?: string | typeof Blockly.Field.SKIP_SETUP,
    instanceName?: string | null,
    uniqueName = false,
    lockNew = false,
    lockRename = false,
    editDropdownData?: EditDropdownData | null,
    validator?: FieldDropdownValidator,
    config?: FieldInstanceConfig,
  ) {
    super(Blockly.Field.SKIP_SETUP);

    if (instanceType === Blockly.Field.SKIP_SETUP) {
      return;
    }

    this.menuGenerator_ = () => this.buildMenuOptions_();
    this.editDropdownData = editDropdownData ?? null;
    if (validator) {
      this.userValidator_ = validator;
    }

    const merged: FieldInstanceConfig = {
      ...(config ?? {}),
      instanceType:
        typeof instanceType === "string"
          ? instanceType
          : (config?.instanceType ?? ""),
      instanceName:
        instanceName !== undefined ? instanceName : (config?.instanceName ?? null),
      uniqueName: uniqueName || !!config?.uniqueName,
      lockNew: lockNew || !!config?.lockNew,
      lockRename: lockRename || !!config?.lockRename,
    };
    this.configure_(merged);
    this.setValidator(this.composedValidator_);

    const name = merged.instanceName;
    this.setValue(name && String(name).trim() ? String(name) : "");
  }

  protected override configure_(config: FieldInstanceConfig): void {
    super.configure_(config);
    if (config.instanceType) {
      this.instanceType_ = config.instanceType;
    }
    if (config.uniqueName !== undefined) {
      this.uniqueName_ = !!config.uniqueName;
    }
    if (config.lockNew !== undefined) {
      this.lockNew_ = !!config.lockNew;
    }
    if (config.lockRename !== undefined) {
      this.lockRename_ = !!config.lockRename;
    }
  }

  getInstanceType(): string {
    return this.instanceType_;
  }

  getInstanceTypeValue(instanceType: string): string | undefined {
    if (instanceType !== this.instanceType_) {
      return undefined;
    }
    const value = this.getValue();
    return value || undefined;
  }

  override initModel(): void {
    super.initModel();
    this.ensureInstanceName_();
  }

  private ensureInstanceName_(): void {
    const block = this.getSourceBlock();
    if (!block || block.isInsertionMarker()) {
      return;
    }
    const workspace = block.isInFlyout
      ? (block.workspace as Blockly.WorkspaceSvg).targetWorkspace
      : block.workspace;
    if (!workspace) {
      return;
    }

    const current = this.getValue();
    if (!current) {
      this.setValue(generateUniqueName(workspace));
      return;
    }

    if (this.uniqueName_) {
      if (!block.isInFlyout) {
        this.setValue(convertToUniqueNameBlock(current, block));
      }
      return;
    }

    const instanceList = allInstancesOf(this.instanceType_, block.workspace);
    if (instanceList.indexOf(current) === -1) {
      const existing = getAnyInstanceOf(this.instanceType_, workspace);
      if (existing) {
        this.setValue(existing);
      }
    }
  }

  /**
   * Accept any non-empty instance name (not only current menu options),
   * so rename / new can set freshly generated names.
   */
  protected override doClassValidation_(newValue?: string): string | null {
    if (newValue === undefined || newValue === null) {
      return null;
    }
    const renameLabel = getBlocklyMsgOr("RENAME_INSTANCE", "Rename Instance");
    const newLabel = getBlocklyMsgOr("NEW_INSTANCE", "New Instance");
    if (newValue === renameLabel || newValue === newLabel) {
      return newValue;
    }
    if (typeof newValue !== "string" || !newValue.trim()) {
      return null;
    }
    const block = this.getSourceBlock();
    const workspace = block?.workspace;
    if (workspace && findVariableNameCollision(newValue, workspace)) {
      return null;
    }
    return newValue;
  }

  /** Keep display text in sync when the value is not yet in the option list. */
  protected override doValueUpdate_(newValue: string): void {
    super.doValueUpdate_(newValue);
    const self = this as unknown as { selectedOption: MenuOption };
    self.selectedOption = [newValue, newValue];
  }

  protected override getText_(): string | null {
    return this.getValue();
  }

  private buildMenuOptions_(): MenuOption[] {
    const block = this.getSourceBlock();
    let instanceList: string[] = [];
    if (block?.workspace) {
      instanceList = allInstancesOf(this.instanceType_, block.workspace);
    }
    const name = this.getValue() ?? "";
    if (name && instanceList.indexOf(name) === -1) {
      instanceList.push(name);
    }
    instanceList.sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );

    if (!this.lockRename_) {
      instanceList.push(
        getBlocklyMsgOr("RENAME_INSTANCE", "Rename Instance"),
      );
    }
    if (!this.lockNew_) {
      instanceList.push(getBlocklyMsgOr("NEW_INSTANCE", "New Instance"));
    }

    let options: MenuOption[] = instanceList.map((item) => [item, item]);
    if (this.editDropdownData) {
      options = this.editDropdownData(options);
    }
    return options.length ? options : [["", ""]];
  }

  private composedValidator_: FieldDropdownValidator = (text) => {
    const user = this.userValidator_;
    let value: string | null | undefined = text;
    if (user) {
      const userResult = user.call(this, text);
      if (userResult === null) {
        return null;
      }
      if (userResult !== undefined) {
        value = userResult;
      }
    }
    return this.handleSpecialMenuChoice_(value ?? text);
  };

  private handleSpecialMenuChoice_(
    text: string,
  ): string | null | undefined {
    const block = this.getSourceBlock();
    const workspace = block?.workspace;
    if (!workspace) {
      return undefined;
    }

    const renameLabel = getBlocklyMsgOr("RENAME_INSTANCE", "Rename Instance");
    const newLabel = getBlocklyMsgOr("NEW_INSTANCE", "New Instance");

    if (text === renameLabel) {
      const oldInstance = this.getValue() ?? this.getText();
      const promptRename = (suggested: string): void => {
        Blockly.dialog.prompt(
          getBlocklyMsgOr(
            "RENAME_INSTANCE_TITLE",
            'Rename all "%1" instances to:',
          ).replace("%1", oldInstance),
          suggested,
          (newName) => {
            const cleaned = sanitizeInstanceName(newName);
            if (!cleaned) {
              return;
            }
            const varHit = findVariableNameCollision(cleaned, workspace);
            if (varHit) {
              Blockly.dialog.alert(
                getBlocklyMsgOr(
                  "INSTANCE_NAME_COLLIDES_WITH_VARIABLE",
                  'The name "%1" is already used by a variable.',
                ).replace("%1", cleaned),
                () => promptRename(cleaned),
              );
              return;
            }
            renameInstance(
              oldInstance,
              cleaned,
              this.instanceType_,
              workspace,
            );
          },
        );
      };
      promptRename(oldInstance);
      return null;
    }

    if (text === newLabel) {
      const promptNew = (suggested: string): void => {
        Blockly.dialog.prompt(
          getBlocklyMsgOr("NEW_INSTANCE_TITLE", "New instance name:"),
          suggested,
          (newName) => {
            const cleaned = sanitizeInstanceName(newName);
            if (!cleaned || !block) {
              return;
            }
            const varHit = findVariableNameCollision(cleaned, workspace);
            if (varHit) {
              Blockly.dialog.alert(
                getBlocklyMsgOr(
                  "INSTANCE_NAME_COLLIDES_WITH_VARIABLE",
                  'The name "%1" is already used by a variable.',
                ).replace("%1", cleaned),
                () => promptNew(cleaned),
              );
              return;
            }
            this.setValue(convertToUniqueNameBlock(cleaned, block));
          },
        );
      };
      promptNew(generateUniqueName(workspace));
      return null;
    }

    return undefined;
  }

  static fromJson(options: FieldInstanceFromJsonConfig): FieldInstance {
    return new FieldInstance(
      options.instanceType,
      options.instanceName ?? null,
      !!options.uniqueName,
      !!options.lockNew,
      !!options.lockRename,
      null,
      undefined,
      options,
    );
  }
}

function sanitizeInstanceName(raw: string | null): string | null {
  if (!raw) {
    return null;
  }
  const cleaned = raw.replace(/[\s\xa0]+/g, " ").replace(/^ | $/g, "");
  if (
    !cleaned ||
    cleaned === getBlocklyMsgOr("RENAME_INSTANCE", "Rename Instance") ||
    cleaned === getBlocklyMsgOr("NEW_INSTANCE", "New Instance")
  ) {
    return null;
  }
  return cleaned;
}

/**
 * Registers `field_instance` in Blockly's field registry (idempotent).
 */
export function registerFieldInstance(): void {
  try {
    Blockly.fieldRegistry.register("field_instance", FieldInstance);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/already registered/i.test(message)) {
      throw err;
    }
  }
}
