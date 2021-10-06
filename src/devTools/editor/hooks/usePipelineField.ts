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

import { useSelector } from "react-redux";
import { selectTraceError } from "@/devTools/editor/slices/runtimeSelectors";
import { useCallback } from "react";
import { BlockPipeline } from "@/blocks/types";
import {
  FieldHelperProps,
  FieldInputProps,
  FieldMetaProps,
  useField,
  useFormikContext,
  setNestedObjectValues,
} from "formik";
import { TraceError } from "@/telemetry/trace";
import { useAsyncEffect } from "use-async-effect";
import traceErrorInputValidator from "../validators/traceErrorInputValidator";
import traceErrorGeneralValidator from "../validators/traceErrorGeneralValidator";

function usePipelineField(
  pipelineFieldName: string
): [
  FieldInputProps<BlockPipeline>,
  FieldMetaProps<BlockPipeline>,
  FieldHelperProps<BlockPipeline>,
  TraceError
] {
  const errorTraceEntry = useSelector(selectTraceError);

  const validatePipeline = useCallback(
    (pipeline: BlockPipeline) => {
      if (!errorTraceEntry) {
        return;
      }

      const { error: traceError, blockInstanceId } = errorTraceEntry;
      const blockIndex = pipeline.findIndex(
        (block) => block.instanceId === blockInstanceId
      );
      if (blockIndex === -1) {
        return;
      }

      const formikErrors: Record<string, unknown> = {};
      traceErrorInputValidator(formikErrors, traceError, blockIndex);
      traceErrorGeneralValidator(formikErrors, traceError, blockIndex);

      return formikErrors;
    },
    [errorTraceEntry]
  );

  const formikField = useField<BlockPipeline>({
    name: pipelineFieldName,
    // @ts-expect-error working with nested errors
    validate: validatePipeline,
  });

  const formikContext = useFormikContext();
  useAsyncEffect(
    async (isMounted) => {
      const validationErrors = await formikContext.validateForm();
      if (!isMounted()) {
        return;
      }

      if (Object.keys(validationErrors).length > 0) {
        formikContext.setTouched(setNestedObjectValues(validationErrors, true));
      }
    },
    [errorTraceEntry]
  );

  return [...formikField, errorTraceEntry];
}

export default usePipelineField;
