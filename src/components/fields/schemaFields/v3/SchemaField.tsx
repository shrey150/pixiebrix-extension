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
import { SchemaFieldComponent } from "@/components/fields/schemaFields/propTypes";
import { isServiceField } from "@/components/fields/schemaFields/v1/ServiceField";
import BasicSchemaField from "@/components/fields/schemaFields/v3/BasicSchemaField";
import ServiceField from "@/components/fields/schemaFields/v3/ServiceField";

const SchemaField: SchemaFieldComponent = (props) => {
  const { schema } = props;

  if (isServiceField(schema)) {
    return <ServiceField {...props} />;
  }

  return <BasicSchemaField {...props} />;
};

export default SchemaField;
