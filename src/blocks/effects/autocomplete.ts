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

import { Effect } from "@/types";
import { BlockOptions, Schema } from "@/core";
import { propertiesToSchema } from "@/validators/generic";
import { registerBlock } from "@/blocks/registry";
import { AutocompleteItem } from "autocompleter";

export class AutocompleteEffect extends Effect {
  constructor() {
    super(
      "@pixiebrix/autocomplete",
      "Attach Autocomplete",
      "Attach autocomplete suggestions to an input"
    );
  }

  inputSchema: Schema = propertiesToSchema(
    {
      selector: {
        type: "string",
        format: "selector",
      },
      options: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
    ["selector", "options"]
  );

  async effect(
    {
      selector,
      options,
    }: {
      selector: string;
      options: string[];
    },
    { logger }: BlockOptions
  ): Promise<void> {
    const $elt = $(document).find(selector);

    if ($elt.length === 0) {
      logger.warn("No elements found for selector");
      return;
    }

    const { default: autocompleter } = await import("autocompleter");

    autocompleter({
      input: $elt.get(0) as HTMLInputElement,
      onSelect: (item) => {
        $elt.val(item.label);
      },
      fetch: (text: string, update: (items: AutocompleteItem[]) => void) => {
        const normalized = text.toLowerCase();
        update(
          options
            .filter((x) => x.toLowerCase().includes(normalized))
            .map((label) => ({ label }))
        );
      },
    });
  }
}

registerBlock(new AutocompleteEffect());
