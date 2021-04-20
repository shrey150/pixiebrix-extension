/*
 * Copyright (C) 2021 Pixie Brix, LLC
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

import {
  BlockConfig,
  blockList,
  BlockPipeline,
  mergeReaders,
} from "@/blocks/combinators";
import { ExtensionPoint } from "@/types";
import { IBlock, IExtension, IExtensionPoint, IReader, Schema } from "@/core";
import { propertiesToSchema } from "@/validators/generic";
import {
  ExtensionPointConfig,
  ExtensionPointDefinition,
} from "@/extensionPoints/types";
import { Permissions } from "webextension-polyfill-ts";
import { PanelConfig } from "@/extensionPoints/panelExtension";
import { checkAvailable } from "@/blocks/available";

export interface ActionPanelConfig {
  heading: string;
  body: BlockConfig | BlockPipeline;
}

let _extensions: IExtension<ActionPanelConfig>[] = [];

export abstract class ActionPanelExtensionPoint extends ExtensionPoint<ActionPanelConfig> {
  readonly permissions: Permissions.Permissions = {};

  protected constructor(
    id: string,
    name: string,
    description?: string,
    icon = "faColumns"
  ) {
    super(id, name, description, icon);
  }

  inputSchema: Schema = propertiesToSchema(
    {
      heading: {
        type: "string",
        description: "The heading for the panel",
      },
      body: {
        oneOf: [
          { $ref: "https://app.pixiebrix.com/schemas/renderer#" },
          {
            type: "array",
            items: { $ref: "https://app.pixiebrix.com/schemas/block#" },
          },
        ],
      },
    },
    ["heading", "body"]
  );

  async getBlocks(extension: IExtension<PanelConfig>): Promise<IBlock[]> {
    return blockList(extension.config.body);
  }

  removeExtensions(): void {
    const currentIds = new Set<string>(this.extensions.map((x) => x.id));
    _extensions = _extensions.filter((x) => !currentIds.has(x.id));
  }

  private async registerExtension(
    extension: IExtension<ActionPanelConfig>
  ): Promise<void> {
    if (!_extensions.some((x) => x.id === extension.id)) {
      _extensions.push(extension);
    }
  }

  async run(): Promise<void> {
    if (!this.extensions.length) {
      console.debug(
        `contextMenu extension point ${this.id} has no installed extension`
      );
      return;
    }

    for (const extension of this.extensions) {
      await this.registerExtension(extension);
    }
  }

  async install(): Promise<boolean> {
    return await this.isAvailable();
  }
}

export type PanelDefinition = ExtensionPointDefinition;

class RemotePanelExtensionPoint extends ActionPanelExtensionPoint {
  private readonly _definition: PanelDefinition;

  constructor(config: ExtensionPointConfig<PanelDefinition>) {
    const { id, name, description } = config.metadata;
    super(id, name, description);
    this._definition = config.definition;
  }

  async defaultReader(): Promise<IReader> {
    return await mergeReaders(this._definition.reader);
  }

  async isAvailable(): Promise<boolean> {
    return await checkAvailable(this._definition.isAvailable);
  }
}

export function fromJS(
  config: ExtensionPointConfig<PanelDefinition>
): IExtensionPoint {
  const { type } = config.definition;
  if (type !== "actionPanel") {
    throw new Error(`Expected type=actionPanel, got ${type}`);
  }
  return new RemotePanelExtensionPoint(config);
}
