/*
 * Copyright (C) 2021 PixieBrix, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import React from "react";
import DataItem from "@/devTools/editor/components/dataItem/DataItem";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Components/DataItem",
  component: DataItem
} as ComponentMeta<typeof DataItem>

const Story: ComponentStory<typeof DataItem> = (args) => (
  <DataItem {...args}/>
);

export const String = Story.bind({});
String.args = {
  name: "string1",
  type: "string",
  value: "This is an example string",
};

export const Stale = Story.bind({});
Stale.args = {
  name: "string2",
  type: "string",
  value: "This is a stale string",
  isStale: true
};

export const Muted = Story.bind({});
Muted.args = {
  name: "string3",
  type: "string",
  value: "This is a muted string",
  isMuted: true
};

export const ObjectItem = Story.bind({});
ObjectItem.args = {
  name: "myObject",
  type: "object",
  value: {
    foo: "abc",
    bar: 31,
    baz: false
  }
};

export const ArrayItem = Story.bind({});
ArrayItem.args = {
  name: "myArray",
  type: "array",
  value: ["def", true, 42]
};
