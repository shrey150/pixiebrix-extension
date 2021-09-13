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

import { liftBackground } from "@/background/protocol";
import * as native from "@/telemetry/trace";
import { TraceEntryData, TraceExitData } from "@/telemetry/trace";
import { UUID } from "@/core";

export const recordTraceEntry = liftBackground(
  "RECORD_TRACE_ENTRY",
  async (record: TraceEntryData) => native.addTraceEntry(record)
);

export const recordTraceExit = liftBackground(
  "RECORD_TRACE_EXIT",
  async (record: TraceExitData) => native.addTraceExit(record)
);

export const clearExtensionTraces = liftBackground(
  "CLEAR_EXTENSION_TRACES",
  async (extensionId: UUID) => native.clearExtensionTraces(extensionId)
);