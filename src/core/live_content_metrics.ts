/**
 * @packageDocumentation
 * @module LiveContentMetrics
 * @description Content bounding metrics that ignore disposing / dead workspace elements.
 * @remarks
 * Blockly's {@link Blockly.WorkspaceSvg.getBlocksBoundingBox} still includes top-level
 * elements that are disposing (e.g. a block mid-delete at the trashcan). That inflates
 * content metrics used by `\@blockly/workspace-content-highlight`, scroll area and minimap.
 * Call {@link installLiveBlocksBoundingBoxPatch} once at kernel register so the upstream
 * highlight plugin can stay unmodified.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as Blockly from "blockly";

type MaybeDead = Blockly.IBoundedElement & {
  isDeadOrDying?: () => boolean;
  isInsertionMarker?: () => boolean;
};

type MetricsCacheEntry = {
  frame: number;
  workspaceCoordinates: boolean;
  value: Blockly.MetricsManager.ContainerRegion;
};

let metricsFrame = 0;
let metricsFrameScheduled = false;

const bumpMetricsFrame = (): void => {
  if (metricsFrameScheduled) {
    return;
  }
  metricsFrameScheduled = true;
  requestAnimationFrame(() => {
    metricsFrame += 1;
    metricsFrameScheduled = false;
  });
};

const metricsCache = new WeakMap<Blockly.WorkspaceSvg, MetricsCacheEntry>();

/**
 * Bounding box of live top-level blocks/comments only (workspace coordinates).
 * @param workspace - Blockly workspace.
 * @returns Operation result.
 */
export const getLiveBlocksBoundingBox = (
  workspace: Blockly.WorkspaceSvg,
): Blockly.utils.Rect => {
  const elements = workspace.getTopBoundedElements();
  let bounds: Blockly.utils.Rect | null = null;

  for (const element of elements) {
    const live = element as MaybeDead;
    if (live.isInsertionMarker?.()) {
      continue;
    }
    if (live.isDeadOrDying?.()) {
      continue;
    }
    const rect = element.getBoundingRectangle();
    if (!bounds) {
      bounds = new Blockly.utils.Rect(
        rect.top,
        rect.bottom,
        rect.left,
        rect.right,
      );
      continue;
    }
    bounds.top = Math.min(bounds.top, rect.top);
    bounds.bottom = Math.max(bounds.bottom, rect.bottom);
    bounds.left = Math.min(bounds.left, rect.left);
    bounds.right = Math.max(bounds.right, rect.right);
  }

  return bounds ?? new Blockly.utils.Rect(0, 0, 0, 0);
};

const computeLiveContentMetrics = (
  workspace: Blockly.WorkspaceSvg,
  workspaceCoordinates: boolean,
): Blockly.MetricsManager.ContainerRegion => {
  const box = getLiveBlocksBoundingBox(workspace);
  const scale = workspaceCoordinates ? 1 : workspace.scale;
  return {
    height: (box.bottom - box.top) * scale,
    width: (box.right - box.left) * scale,
    top: box.top * scale,
    left: box.left * scale,
  };
};

/**
 * Content metrics from live elements only (same shape as MetricsManager.getContentMetrics).
 * @param workspace - Blockly workspace.
 * @param workspaceCoordinates - The `workspaceCoordinates` argument.
 * @returns Operation result.
 */
export const getLiveContentMetrics = (
  workspace: Blockly.WorkspaceSvg,
  workspaceCoordinates = true,
): Blockly.MetricsManager.ContainerRegion => {
  bumpMetricsFrame();
  const cached = metricsCache.get(workspace);
  if (
    cached &&
    cached.frame === metricsFrame &&
    cached.workspaceCoordinates === workspaceCoordinates
  ) {
    return cached.value;
  }
  const value = computeLiveContentMetrics(workspace, workspaceCoordinates);
  metricsCache.set(workspace, {
    frame: metricsFrame,
    workspaceCoordinates,
    value,
  });
  return value;
};

let blocksBoundingBoxPatched = false;

/**
 * Patches {@link Blockly.WorkspaceSvg.getBlocksBoundingBox} to ignore disposing elements. Lets the upstream content-highlight plugin (and other metrics consumers) measure live content only — without forking that plugin.
 */
export const installLiveBlocksBoundingBoxPatch = (): void => {
  if (blocksBoundingBoxPatched) {
    return;
  }
  blocksBoundingBoxPatched = true;
  Blockly.WorkspaceSvg.prototype.getBlocksBoundingBox = function (
    this: Blockly.WorkspaceSvg,
  ): Blockly.utils.Rect {
    return getLiveBlocksBoundingBox(this);
  };
};
