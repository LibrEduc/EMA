/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class responsible for creating a modal used for creating typed
 *     variables.
 * @author aschmiedt@google.com (Abby Schmiedt)
 * Adapted for µcBlockly by scanet@libreduc.cc (Sébastien Canet)
 */

import * as Blockly from "blockly";
import { Modal } from "@blockly/plugin-modal";

/**
 * Messages for a typed variable modal.
 */
export interface TypedVarModalMessages {
  TYPED_VAR_MODAL_CONFIRM_BUTTON: string;
  TYPED_VAR_MODAL_VARIABLE_NAME_LABEL: string;
  TYPED_VAR_MODAL_TYPES_LABEL: string;
  TYPED_VAR_MODAL_TITLE: string;
  TYPED_VAR_MODAL_INVALID_NAME: string;
  TYPED_VAR_MODAL_CANCEL_BUTTON: string;
}

/**
 * Class for displaying a modal used for creating typed variables.
 */
export class TypedVariableModal extends Modal {
  /**
   * The id of the currently selected type.
   * @private
   */
  private selectedType_: string | null = null;

  /**
   * The input div holding the name of the variable.
   * @protected
   */
  protected variableNameInput_: HTMLInputElement | null = null;

  /**
   * The div holding the list of variable types.
   * @protected
   */
  protected variableTypesDiv_: HTMLElement | null = null;

  /**
   * The first type input.
   * @protected
   */
  protected firstTypeInput_: HTMLInputElement | null = null;

  /**
   * The name used to register the button callback.
   * @private
   */
  private btnCallBackName_: string;

  /**
   * An array holding arrays with the name of the type and the display name
   *     for the type. Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
   * @protected
   */
  protected types_: Array<[string, string]>;

  /**
   * Constructor for creating a typed variable modal.
   * @param workspace The workspace that the modal will be registered on.
   * @param btnCallbackName The name used to register the button callback.
   * @param types An array holding arrays with the display name as the first
   *     value and the type as the second. Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
   * @param optMessages The messages for a typed variable modal.
   */
  constructor(
    workspace: Blockly.WorkspaceSvg,
    btnCallbackName: string,
    types: Array<[string, string]>,
    optMessages?: Partial<TypedVarModalMessages>
  ) {
    const title =
      (optMessages && optMessages["TYPED_VAR_MODAL_TITLE"]) ||
      "Create Typed Variable";
    super(title, workspace);

    this.btnCallBackName_ = btnCallbackName;
    this.types_ = types;

    const messages: TypedVarModalMessages = {
      TYPED_VAR_MODAL_TITLE: "Create Typed Variable",
      TYPED_VAR_MODAL_VARIABLE_NAME_LABEL: "Variable Name: ",
      TYPED_VAR_MODAL_TYPES_LABEL: "Variable Types",
      TYPED_VAR_MODAL_CONFIRM_BUTTON: "Ok",
      TYPED_VAR_MODAL_CANCEL_BUTTON: "Cancel",
      TYPED_VAR_MODAL_INVALID_NAME:
        "Name is not valid. Please choose a different name.",
      ...optMessages,
    };

    this.setLocale(messages);

    /**
     * If true close the modal when the user clicks outside the modal.
     * Otherwise, only close when user hits the 'X' button or escape.
     */
    this.shouldCloseOnOverlayClick = false;
  }

  /**
   * Create a typed variable modal and display it on the given button name.
   */
  init(): void {
    super.init();
    this.workspace_.registerButtonCallback(this.btnCallBackName_, () => {
      this.show();
    });
  }

  /**
   * Set the messages for the typed variable modal.
   * Used to change the location.
   * @param messages The messages needed to create a typed modal.
   */
  setLocale(messages: TypedVarModalMessages): void {
    Object.keys(messages).forEach((k) => {
      (Blockly.Msg as Record<string, string>)[k] = messages[k as keyof TypedVarModalMessages];
    });
  }

  /**
   * Dispose of the typed variable modal.
   */
  dispose(): void {
    super.dispose();
    this.workspace_.removeButtonCallback(this.btnCallBackName_);
  }

  /**
   * Get the selected type.
   * @returns The selected type.
   * @protected
   */
  protected getSelectedType_(): string | null {
    return this.selectedType_;
  }

  /**
   * Disposes of any events or dom-references belonging to the editor and resets
   * the inputs.
   */
  widgetDispose_(): void {
    super.widgetDispose_();
    this.resetModalInputs_();
  }

  /**
   * Get the function to be called when the user tries to create a variable.
   * @protected
   */
  protected onConfirm_(): void {
    const text = this.getValidInput_();
    const type = this.getSelectedType_() || "";
    if (text) {
      const existing = Blockly.Variables.nameUsedWithAnyType(
        text,
        this.workspace_,
      ) as { type?: string; name?: string } | null;
      if (existing) {
        const existingType = existing.type || "";
        const existingName = existing.name || "";
        let msg = "";
        if (existingType === type) {
          msg = Blockly.Msg["VARIABLE_ALREADY_EXISTS"].replace(
            "%1",
            existingName,
          );
        } else {
          msg = Blockly.Msg["VARIABLE_ALREADY_EXISTS_FOR_ANOTHER_TYPE"];
          msg = msg
            .replace("%1", existingName)
            .replace("%2", this.getDisplayName_(existingType));
        }
        Blockly.dialog.alert(msg);
      } else {
        // No conflict
        this.workspace_.createVariable(text, type);
        this.hide();
      }
    } else {
      Blockly.dialog.alert(Blockly.Msg["TYPED_VAR_MODAL_INVALID_NAME"]);
    }
  }

  /**
   * Get the display name for the given type.
   * @param type The type to get the display name for.
   * @returns The display name for the type.
   * @private
   */
  private getDisplayName_(type: string): string {
    for (let i = 0; i < this.types_.length; i++) {
      const typeNames = this.types_[i];
      if (type === typeNames[1]) {
        return typeNames[0];
      }
    }
    return "";
  }

  /**
   * Get the valid variable name, or null if the name is not valid.
   * @returns The valid variable name, or null if the name exists.
   * @private
   */
  private getValidInput_(): string | null {
    if (!this.variableNameInput_) {
      return null;
    }
    let newVar = this.variableNameInput_.value;
    if (newVar) {
      newVar = newVar.replace(/[\s\xa0]+/g, " ").trim();
      if (
        newVar === Blockly.Msg["RENAME_VARIABLE"] ||
        newVar === Blockly.Msg["NEW_VARIABLE"]
      ) {
        // Ok, not ALL names are legal...
        newVar = "";
      }
    }
    return newVar || null;
  }

  /**
   * Render content for the modal content div.
   * @param contentContainer The modal's content div.
   */
  renderContent_(contentContainer: HTMLDivElement): void {
    const varNameContainer = this.createVarNameContainer_();
    this.variableNameInput_ = varNameContainer.querySelector(
      ".typedModalVariableNameInput",
    ) as HTMLInputElement;

    const typedVarDiv = document.createElement("div");
    typedVarDiv.className = "typedModalTypes";
    typedVarDiv.textContent = Blockly.Msg["TYPED_VAR_MODAL_TYPES_LABEL"];

    this.variableTypesDiv_ = this.createVariableTypeContainer_(this.types_);
    this.resetModalInputs_();
    typedVarDiv.appendChild(this.variableTypesDiv_);
    contentContainer.appendChild(varNameContainer);
    contentContainer.appendChild(typedVarDiv);
  }

  /**
   * Render content for the modal footer.
   * @param footerContainer The modal's footer div.
   */
  renderFooter_(footerContainer: HTMLElement): void {
    footerContainer.appendChild(this.createConfirmBtn_());
    footerContainer.appendChild(this.createCancelBtn_());
  }

  /**
   * Create button in charge of creating the variable.
   * @returns The button in charge of creating a variable.
   * @protected
   */
  protected createConfirmBtn_(): HTMLButtonElement {
    const confirmBtn = document.createElement("button");
    confirmBtn.className = "blocklyModalBtn blocklyModalBtnPrimary";
    confirmBtn.textContent = Blockly.Msg["TYPED_VAR_MODAL_CONFIRM_BUTTON"];
    this.addEvent_(confirmBtn, "click", this, this.onConfirm_);
    return confirmBtn;
  }

  /**
   * Create button in charge of cancelling.
   * @returns The button in charge of cancelling.
   * @protected
   */
  protected createCancelBtn_(): HTMLButtonElement {
    const cancelBtn = document.createElement("button");
    cancelBtn.className = "blocklyModalBtn";
    cancelBtn.textContent = Blockly.Msg["TYPED_VAR_MODAL_CANCEL_BUTTON"];
    this.addEvent_(cancelBtn, "click", this, this.onCancel_);
    return cancelBtn;
  }

  /**
   * Check the first type in the list.
   * @protected
   */
  protected resetModalInputs_(): void {
    if (this.firstTypeInput_) {
      this.firstTypeInput_.checked = true;
      this.selectedType_ = this.firstTypeInput_.id;
    }
    if (this.variableNameInput_) {
      this.variableNameInput_.value = "";
    }
  }

  /**
   * Creates an unordered list containing all the types.
   * @param types An array holding arrays with the display name as the first
   *     value and the type as the second. Ex: [['Penguin', 'PENGUIN'], ['Giraffe', 'GIRAFFE']].
   * @returns The list of types.
   * @protected
   */
  protected createVariableTypeContainer_(
    types: Array<[string, string]>,
  ): HTMLElement {
    const typeList = document.createElement("ul");
    typeList.className = "typedModalList";
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      const typeDisplayName = type[0];
      const typeName = type[1];
      const typeLi = document.createElement("li");
      const typeInput = document.createElement("input");
      typeInput.className = "typedModalTypes";
      typeInput.type = "radio";
      typeInput.id = typeName;
      typeInput.name = "blocklyVariableType";
      this.addEvent_(typeInput, "click", this, (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.selectedType_ = target.id;
      });
      if (i === 0) {
        this.firstTypeInput_ = typeInput;
      }
      const typeLabel = document.createElement("label");
      typeLabel.textContent = typeDisplayName;
      typeLabel.setAttribute("for", typeName);

      typeLi.appendChild(typeInput);
      typeLi.appendChild(typeLabel);
      typeList.appendChild(typeLi);
    }
    return typeList;
  }

  /**
   * Create the div that holds the text input and label for the variable name
   * input.
   * @returns The div holding the text input and label for text input.
   * @protected
   */
  protected createVarNameContainer_(): HTMLDivElement {
    const varNameContainer = document.createElement("div");
    varNameContainer.className = "typedModalVariableInputContainer";

    const varNameLabel = document.createElement("label");
    varNameLabel.className = "typedModalVariableLabel";
    varNameLabel.textContent =
      Blockly.Msg["TYPED_VAR_MODAL_VARIABLE_NAME_LABEL"];
    varNameLabel.setAttribute("for", "variableInput");

    const varNameInput = document.createElement("input");
    varNameInput.className = "typedModalVariableNameInput";
    varNameInput.type = "text";
    varNameInput.id = "variableInput";

    varNameContainer.appendChild(varNameLabel);
    varNameContainer.appendChild(varNameInput);
    return varNameContainer;
  }
}

// Register CSS styles
Blockly.Css.register(`
.typedModalTitle {
  font-weight: bold;
  font-size: 1em;
}
.typedModalVariableInputContainer {
  margin: 1em 0 1em 0;
}
.typedModalVariableLabel{
  margin-right: 0.5em;
}
.typedModalTypes ul{
  display: flex;
  flex-wrap: wrap;
  list-style-type: none;
  padding: 0;
}
.typedModalTypes li {
  margin-right: 1em;
  display: flex;
}
`);
