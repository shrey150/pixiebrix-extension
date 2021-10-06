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

import { isInputValidationError } from "@/blocks/errors";
import { TraceError } from "@/telemetry/trace";
import { joinName } from "@/utils";
import { OutputUnit } from "@cfworker/json-schema";
import { set } from "lodash";
import { JsonObject } from "type-fest";

const REQUIRED_FIELD_REGEX = /^Instance does not have required property "(?<property>.+)"\.$/;

/**
 * Gets Input validation error from the Trace
 * @param pipelineErrors Pipeline validation errors for the Formik context.
 * @param traceError Serialized error from running the block ({@link TraceError.error}).
 * @param blockIndex Index of block that generated the Trace Error.
 * @returns True if errors found, false otherwise.
 */
function traceErrorInputValidator(
  pipelineErrors: Record<string, unknown>,
  traceError: JsonObject,
  blockIndex: string
): boolean {
  if (!isInputValidationError(traceError)) {
    return false;
  }

  for (const unit of (traceError.errors as unknown) as OutputUnit[]) {
    let propertyNameInPipeline: string;
    let errorMessage: string;

    const property = REQUIRED_FIELD_REGEX.exec(unit.error)?.groups.property;
    if (property) {
      propertyNameInPipeline = joinName(String(blockIndex), "config", property);
      errorMessage = "Error from the last run: This field is required";
    } else {
      propertyNameInPipeline = String(blockIndex);
      errorMessage = traceError.message;
    }

    set(pipelineErrors, propertyNameInPipeline, errorMessage);
  }

  return true;
}

export default traceErrorInputValidator;
