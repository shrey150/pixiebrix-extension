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

import { traceErrorFactory } from "@/tests/factories";
import { uuidv4 } from "@/types/helpers";
import traceErrorGeneralValidator from "./traceErrorGeneralValidator";

test("sets block error", () => {
  const pipelineErrors: Record<string, unknown> = {};
  const blockInstanceId = uuidv4();
  const errorTraceEntry = traceErrorFactory({ blockInstanceId });

  traceErrorGeneralValidator(pipelineErrors, errorTraceEntry);

  expect(pipelineErrors[blockInstanceId]).toBe(errorTraceEntry.error.message);
});

test("doesn't override nested error", () => {
  const blockInstanceId = uuidv4();
  const errorTraceEntry = traceErrorFactory({ blockInstanceId });

  const nestedBlockError = {
    config: {
      name: "Nested Error",
    },
  };
  const pipelineErrors = {
    [blockInstanceId]: nestedBlockError,
  };

  traceErrorGeneralValidator(pipelineErrors, errorTraceEntry);

  expect(pipelineErrors[blockInstanceId]).toBe(nestedBlockError);
});
