import { split, compose, chain, filter, complement, path, isEmpty } from 'ramda';

import schema from "../schemas/config.schema.json";

export const getPath = split('.');
export const getSchemaPath = compose(chain(n => ['properties', n]),
                                     filter(complement(isEmpty)),
                                     split('.'));
export const getSchema = name => path(getSchemaPath(name), schema);
