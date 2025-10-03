import { Router } from 'express';
import { executeRouteHandler, executeQuery } from '../utils/executors.js';
import { DataNotFoundError, InvalidRequestError } from '../utils/error.js';

// Express router
const router = Router();

// Gets the airline
router.get('/get/:id', async (req, res) => {
  await executeRouteHandler(res, async (client) => {
    // Airline's ID
    const id = req.params.id;

    // Gets the airline
    const airlines = await executeQuery(
      client,
      'SELECT * FROM airlines WHERE ID = $1',
      [id],
    );

    // When the airline was not found
    if (airlines.rows[0] === undefined) {
      throw new DataNotFoundError();
    }

    // returns airlines
    return airlines.rows[0];
  });
});

// Gets all airlines
router.get('/get_all', async (req, res) => {
  await executeRouteHandler(res, async (client) => {
    // Gets airlines
    const airlines = await executeQuery(
      client,
      'SELECT * FROM airlines ORDER BY ID',
    );

    // returns airlines
    return airlines.rows;
  });
});

// Adds an airline
router.post('/add', async (req, res) => {
  await executeRouteHandler(res, async (client) => {
    // Airline's name
    const name = req.body.name;

    // Airline's color code
    const colorCode = req.body.color_code;

    // Adds an airline
    const airline = await executeQuery(
      client,
      'INSERT INTO airlines (name, color_code) VALUES ($1, $2) RETURNING *',
      [name, colorCode],
    );

    // Returns added airline
    return airline.rows[0];
  }, true);
});

// Mods the airline
router.put('/mod/:id', async (req, res) => {
  await executeRouteHandler(res, async (client) => {
    // Airline's ID
    const id = req.params.id;

    // Airline's name
    const name = req.body.name;

    // Airline's color code
    const colorCode = req.body.color_code;

    // Validates request
    if (name === undefined || colorCode === undefined) {
      throw new InvalidRequestError();
    }

    // Mods the airline
    const result = await executeQuery(
      client,
      'UPDATE airlines SET name=$1, color_code=$2 WHERE ID = $3 RETURNING *',
      [name, colorCode, id],
    );

    // When the airline was not found
    if (result.rows[0] === undefined) {
      throw new DataNotFoundError();
    }

    // Returns edited airline
    return result.rows[0];
  }, true);
});

// Deletes the airline
router.delete('/delete/:id', async (req, res) => {
  await executeRouteHandler(res, async (client) => {
    // Airline's ID
    const id = req.params.id;

    // Deletes the airline
    await executeQuery(
      client,
      'DELETE FROM airlines WHERE ID = $1',
      [id],
    );

    // Returns success message
    return {result: 'Delete succeeded'};
  }, true);
});

export default router;
