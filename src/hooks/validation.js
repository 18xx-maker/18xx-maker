import { Draft07, validateAsync } from "json-schema-library";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fromPairs, map } from "ramda";

import configSchemaJSON from "@/schemas/config.schema.json";
import { createSetErrors } from "@/state";
import { getValidationPath } from "@/util/input";

const configSchema = new Draft07(configSchemaJSON);

export const useValidation = () => {
  const dispatch = useDispatch();
  const validationErrors = useSelector((state) => state.errors);

  const validateConfigSchema = useCallback(
    async (config) => {
      const setValidationErrors = (errors) => {
        const errorPointerAsKey = fromPairs(
          map((error) => [error.data.pointer, error], errors),
        );

        dispatch(createSetErrors(errorPointerAsKey));
      };

      const errors = await validateAsync(configSchema, config, {
        onError: (err) => console.log(err),
        schema: configSchema.getSchema(),
      });

      setValidationErrors(errors);

      return errors;
    },
    [dispatch],
  );

  const isValidByInputName = useCallback(
    (name) => {
      const validationPath = getValidationPath(name);
      return validationErrors[validationPath] === undefined;
    },
    [validationErrors],
  );

  return {
    isValidByInputName,
    validateConfigSchema,
  };
};
