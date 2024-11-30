import { Draft07, validateAsync } from "json-schema-library";
import { useDispatch, useSelector } from "react-redux";

import { compose, map } from "ramda";

import configSchemaJSON from "@/schemas/config.schema.json";
import { createSetErrors } from "@/state";
import { getValidationPath } from "@/util/input";

const configSchema = new Draft07(configSchemaJSON);

// TODO: Create generic hook for schemas validation
export const useValidation = () => {
  const dispatch = useDispatch();
  const validationErrors = useSelector((state) => state.errors);

  const setValidationErrors = (errors) => {
    const errorPointerAsKey = Object.fromEntries(
      map((error) => [error.data.pointer, error], errors),
    );

    dispatch(createSetErrors(errorPointerAsKey));
  };

  const validateConfigSchema = async (config) => {
    const errors = await validateAsync(configSchema, config, {
      onError: (err) => console.log(err),
      schema: configSchema.getSchema(),
    });

    setValidationErrors(errors);

    return errors;
  };

  const isValidByPath = (path) => validationErrors[path] === undefined;
  const isValidByInputName = compose(isValidByPath, getValidationPath);

  return {
    isValidByInputName,
    setValidationErrors,
    validateConfigSchema,
    validationErrors,
  };
};
