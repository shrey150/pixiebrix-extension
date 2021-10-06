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

import traceErrorGeneralValidator from "./traceErrorGeneralValidator";

test("sets block error", () => {
  const pipelineErrors: Record<string, unknown> = {};
  const expectedError = "Test Error";
  const blockIndex = "3";

  traceErrorGeneralValidator(
    pipelineErrors,
    {
      message: expectedError,
    },
    blockIndex
  );

  expect(pipelineErrors[blockIndex]).toBe(expectedError);
});

test("doesn't override nested error", () => {
  const notExpectedError = "Test Error";
  const blockIndex = "3";
  const nestedBlockError = {
    config: {
      name: notExpectedError,
    },
  };
  const pipelineErrors = {
    [blockIndex]: nestedBlockError,
  };

  traceErrorGeneralValidator(
    pipelineErrors,
    {
      message: notExpectedError,
    },
    blockIndex
  );

  expect(pipelineErrors[blockIndex]).toBe(nestedBlockError);
});
