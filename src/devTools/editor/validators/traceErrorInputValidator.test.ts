import { traceErrorFactory } from "@/tests/factories";
import { uuidv4 } from "@/types/helpers";
import traceErrorInputValidator from "./traceErrorInputValidator";

test("ignores non input errors", () => {
  const pipelineErrors: Record<string, any> = {};
  const errorTraceEntry = traceErrorFactory();

  const hasInputErrors = traceErrorInputValidator(
    pipelineErrors,
    errorTraceEntry
  );

  expect(hasInputErrors).toBe(false);
  expect(pipelineErrors).toEqual({});
});

test("figures required property error", () => {
  const pipelineErrors: Record<string, any> = {};
  const blockInstanceId = uuidv4();
  const property = "testProp";
  const traceError = {
    schema: {},
    errors: [
      {
        error: `Instance does not have required property "${property}".`,
      },
    ],
  };
  const errorTraceEntry = traceErrorFactory({
    blockInstanceId,
    error: traceError,
  });

  const hasInputErrors = traceErrorInputValidator(
    pipelineErrors,
    errorTraceEntry
  );

  expect(hasInputErrors).toBe(true);
  expect(pipelineErrors[blockInstanceId].config[property]).toEqual(
    "Error from the last run: This field is required"
  );
});

test("sets unknown input error on the block level", () => {
  const pipelineErrors: Record<string, any> = {};
  const blockInstanceId = uuidv4();
  const errorMessage = "This is an unknown input validation error";
  const traceError = {
    schema: {},
    errors: [
      {
        error: errorMessage,
      },
    ],
  };
  const errorTraceEntry = traceErrorFactory({
    blockInstanceId,
    error: traceError,
  });

  const hasInputErrors = traceErrorInputValidator(
    pipelineErrors,
    errorTraceEntry
  );

  expect(hasInputErrors).toBe(true);
  expect(pipelineErrors[blockInstanceId]).toEqual(errorMessage);
});
