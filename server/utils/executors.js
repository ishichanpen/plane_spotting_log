import { pool } from "../index.js";
import { DataNotFoundError, InvalidRequestError } from "./error.js";

/**
 * Executes a route handler.
 *
 * Handles errors and releases the database client automatically.
 *
 * @param {object} res Express response object
 * @param {function} callback Function to do something with database client
 * @param {boolean} transaction Whether to use transaction
 */
export async function executeRouteHandler(res, callback, transaction = false) {
  // Database client
  let client;

  try {
    // Gets a client
    client = await pool.connect();

    // Executes BEGIN statement
    if (transaction) await executeQuery(client, 'BEGIN');

    // Executes callback
    const result = await callback(client);

    // Executes COMMIT statement
    if (transaction) await executeQuery(client, 'COMMIT');

    // Sends a response
    res.status(200).json(result);
  }
  // Error handling
  catch (error) {
    // Logs for debugging purposes
    console.log(error);

    // ROLLBACK statement
    if (transaction && client !== undefined) {
      try {
        await executeQuery(client, 'ROLLBACK');
      } catch (error) {
        console.log(error);
      }
    }

    // Gets information for the response from error
    const responseInformation = getResponseInformation(error);

    // Sends a response
    res.status(responseInformation.code).json({ error: responseInformation.message });
  }
  // Cleanup
  finally {
    // Releases client
    if (client !== undefined) {
      client.release();
    }
  }
}

/**
 * Gets information for the response from error.
 *
 * Returns a status code and an error message.
 *
 * @param {Error} error
 */
function getResponseInformation(error) {
  // HTTP response status code
  let statusCode;

  // error message
  let errorMessage;

  if (error instanceof DataNotFoundError) {
    statusCode = 404;
    errorMessage = 'Not Found';
  }
  else if (error instanceof InvalidRequestError) {
    statusCode = 400;
    errorMessage = 'Invalid Request';
  }
  else {
    statusCode = 500;
    errorMessage = 'Database Error Occurred';
  }

  return { 'code': statusCode, 'message': errorMessage };
}

/**
 * Executes the SQL statement.
 *
 * Logs the SQL statement for debugging purposes.
 *
 * @param {object} client Database client
 * @param {string} query SQL statement
 * @param {Array} params Parameters for the SQL statement
 */
export async function executeQuery(client, query, params = []) {
  // Executes the SQL statement
  const result = await client.query(query, params);

  // Logs for debugging purposes
  console.log(query);
  if (params.length > 0) {
    console.log(params);
  }

  return result;
}
