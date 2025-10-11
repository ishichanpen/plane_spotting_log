import { Router } from 'express';
import {
  noTransaction,
  transaction,
  executeQuery,
} from '../utils/executors.js';
import { validate, validationMode } from '../utils/validators.js';

// Express router
const router = Router();

// Gets the location
router.get('/get/:id', async (req, res) => {
  await noTransaction(res, async (client) => {
    // ID of the location
    const id = req.params.id;

    // Gets the location
    const location = await executeQuery(
      client,
      'SELECT * FROM location WHERE ID = $1',
      [id]
    );

    // When the location was not found
    validate(validationMode.dataNotFound, [location.rows[0]]);

    // returns location
    return location.rows[0];
  });
});

// Gets all location
router.get('/get_all', async (req, res) => {
  await noTransaction(res, async (client) => {
    // Gets location
    const location = await executeQuery(
      client,
      'SELECT * FROM location ORDER BY ID'
    );

    // returns location
    return location.rows;
  });
});

// Adds an location
router.post('/add', async (req, res) => {
  await transaction(res, async (client) => {
    // latitude of the location
    const latitude = req.body.latitude;

    // longitude of the location
    const longitude = req.body.longitude;

    // Validates request
    validate(validationMode.invalidRequest, [latitude, longitude]);

    // Adds an location
    const location = await executeQuery(
      client,
      'INSERT INTO location (latitude, longitude) VALUES ($1, $2) RETURNING *',
      [latitude, longitude]
    );

    // Returns added location
    return location.rows[0];
  });
});

// Mods the location
router.put('/mod/:id', async (req, res) => {
  await transaction(res, async (client) => {
    // ID of the location
    const id = req.params.id;

    // latitude of the location
    const latitude = req.body.latitude;

    // longitude of the location
    const longitude = req.body.longitude;

    // Validates request
    validate(validationMode.invalidRequest, [latitude, longitude]);

    // Mods the location
    const result = await executeQuery(
      client,
      'UPDATE location SET latitude=$1, longitude=$2 WHERE ID = $3 RETURNING *',
      [latitude, longitude, id]
    );

    // When the location was not found
    validate(validationMode.dataNotFound, [result.rows[0]]);

    // Returns edited location
    return result.rows[0];
  });
});

// Deletes the location
router.delete('/delete/:id', async (req, res) => {
  await transaction(res, async (client) => {
    // ID of the location
    const id = req.params.id;

    // Deletes the location
    await executeQuery(client, 'DELETE FROM location WHERE ID = $1', [id]);

    // Returns success message
    return { result: 'Delete succeeded' };
  });
});

export default router;
