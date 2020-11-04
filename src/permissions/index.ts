/*
 * Copyright (C) 2020 Pixie Brix, LLC
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import extensionRegistry from "@/extensionPoints/registry";
import { distinctPermissions } from "@/blocks/available";
import { useAsyncEffect } from "use-async-effect";
import { useState, useCallback } from "react";
import every from "lodash/every";
import { IExtension } from "@/core";
import {
  ExtensionPointDefinition,
  RecipeDefinition,
} from "@/types/definitions";
import { Permissions, browser } from "webextension-polyfill-ts";
import sortBy from "lodash/sortBy";

/**
 * Request any permissions the user has not already granted
 * @param permissionsList
 * @returns {Promise<boolean>}
 */
export async function ensureAllPermissions(
  permissionsList: Permissions.Permissions[]
): Promise<boolean> {
  for (const permissions of permissionsList) {
    if (!(await browser.permissions.contains(permissions))) {
      const granted = await browser.permissions.request(permissions);
      if (!granted) {
        return false;
      }
    }
  }
  return true;
}

export function collectPermissions(
  recipe: RecipeDefinition
): Permissions.Permissions[];
export function collectPermissions(
  extensionPoints: ExtensionPointDefinition[]
): Permissions.Permissions[];
export function collectPermissions(
  recipeOrExtensionPoints: RecipeDefinition | ExtensionPointDefinition[]
): Permissions.Permissions[] {
  const forDefinition = ({ id }: ExtensionPointDefinition) => {
    const extensionPoint = extensionRegistry.lookup(id);
    return extensionPoint.permissions;
  };

  const extensionPoints = Array.isArray(recipeOrExtensionPoints)
    ? recipeOrExtensionPoints
    : recipeOrExtensionPoints.extensionPoints;

  return distinctPermissions(extensionPoints.map(forDefinition));
}

/**
 * Return distinct browser permissions required to run the extension.
 * @param extension
 * @returns {*}
 */
export function extensionPermissions(
  extension: IExtension
): Permissions.Permissions[] {
  const { extensionPointId } = extension;
  const extensionPoint = extensionRegistry.lookup(extensionPointId);
  const blockPermissions = extensionPoint
    .getBlocks(extension)
    .map((x) => x.permissions);
  return distinctPermissions([extensionPoint.permissions, ...blockPermissions]);
}

export async function checkPermissions(
  permissionsList: Permissions.Permissions[]
): Promise<boolean> {
  return every(
    await Promise.all(
      permissionsList.map((permissions) =>
        browser.permissions.contains(permissions)
      )
    )
  );
}

export async function permissionsEnabled(
  extension: IExtension
): Promise<boolean> {
  return await checkPermissions(extensionPermissions(extension));
}

export async function ensureExtensionPermissions(
  extension: IExtension
): Promise<boolean> {
  const permissions = extensionPermissions(extension);
  return await ensureAllPermissions(permissions);
}

export function originPermissions(
  permissions: Permissions.Permissions[]
): Permissions.Permissions[] {
  return sortBy(
    permissions.flatMap((perm) =>
      perm.origins.map((origin) => ({
        origins: [origin],
        permissions: perm.permissions,
      }))
    ),
    (x) => x.origins[0]
  );
}

export function useExtensionPermissions(
  extension: IExtension
): [boolean | undefined, () => Promise<void>] {
  const [enabled, setEnabled] = useState(undefined);

  useAsyncEffect(
    async (mounted) => {
      try {
        const result = await permissionsEnabled(extension);
        if (!mounted()) return;
        setEnabled(result);
      } catch (ex) {
        // If there's an error checking permissions, just assume they're OK. The use will
        // need to fix the configuration before we can check permissions.
        setEnabled(true);
      }
    },
    [extension]
  );

  const request = useCallback(async () => {
    setEnabled(await ensureExtensionPermissions(extension));
  }, [extension]);

  return [enabled, request];
}
