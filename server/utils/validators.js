import { DataNotFoundError, InvalidRequestError } from './error.js';

/**
 * Validates whether none of values are not undefined.
 * If validation fails, throws an Error.
 *
 * @param {object} mode validation mode
 * @param {Array} values values you want to validate
 */
export function validate(mode, values) {
  // Validation
  if (!values.some((arg) => arg === undefined)) {
    return;
  }

  // When validation failed
  switch (mode) {
    case validationMode.invalidRequest:
      throw new InvalidRequestError();
    case validationMode.dataNotFound:
      throw new DataNotFoundError();
    default:
      throw new Error();
  }
}

/**
 * Validation mode.
 */
export const validationMode = {
  invalidRequest: 0,
  dataNotFound: 1,
};
