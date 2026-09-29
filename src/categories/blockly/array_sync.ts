/**
 * @packageDocumentation
 * @module BlocklyCategories.Array.Sync
 * @description Facade re-exporting list sync helpers for array blocks.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export {
  ARRAY_DEFAULT_VAR_NAME,
  applyListDeclarationBlockWarning,
  bindArrayWithDefaultVariable,
  handleArrayListVariableSync,
  revalidateListDeclarationUniqueness,
  syncListDeclarationOwnership,
  syncListDeclarationUniqueness,
} from "./array_sync_ownership";

export {
  handleArrayFixOnChange,
  handleArrayGetIndexOnChange,
  handleArrayModifyOnChange,
  revalidateGetIndexBlocksForVariable,
  syncArrayIndexInputChecks,
  syncArrayListAssignValueInputCheck,
} from "./array_sync_access";

export {
  arrayListLiteralTypeFromInputsOnChange,
  arrayWithDeclareTypeFromInputsOnChange,
} from "./array_sync_literal";
