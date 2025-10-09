import { Router } from 'express';
import {
  executeQuery,
  noTransaction,
  transaction,
} from '../utils/executors.js';
import { validate, validationMode } from '../utils/validators.js';

// Express router
const router = Router();

router.get('/get/:id', async (req, res) => {
  await noTransaction(res, async (client) => {
    // Fleet's ID
    const id = req.params.id;

    // Gets the fleet
    const fleet = await executeQuery(
      client,
      'SELECT * FROM fleet WHERE ID = $1',
      [id]
    );

    // When the fleet was not found
    validate(validationMode.dataNotFound, [fleet.rows[0]]);

    // returns the fleet
    return fleet.rows[0];
  });
});

// Gets all fleets
router.get('/get_all', async (req, res) => {
  await noTransaction(res, async (client) => {
    // Gets fleets
    const fleets = await executeQuery(
      client,
      'SELECT * FROM fleet ORDER BY ID'
    );

    // returns fleets
    return fleets.rows;
  });
});

// Adds an fleet
router.post('/add', async (req, res) => {
  await transaction(res, async (client) => {
    // manufacturer's ID
    const manufacturerId = req.body.manufacturer_id;

    // fleet's name
    const name = req.body.name;

    // fleet's variant
    const variant = req.body.variant;

    // Validates request
    validate(validationMode.invalidRequest, [manufacturerId, name]);

    // Adds an fleet
    const fleet = await executeQuery(
      client,
      'INSERT INTO fleet (manufacturer_id, name, variant) VALUES ($1, $2, $3) RETURNING *',
      [manufacturerId, name, variant]
    );

    // Returns added fleet
    return fleet.rows[0];
  });
});

// Mods the fleet
router.put('/mod/:id', async (req, res) => {
  await transaction(res, async (client) => {
    // fleet's ID
    const id = req.params.id;

    // manufacturer's ID
    const manufacturerId = req.body.manufacturer_id;

    // fleet's name
    const name = req.body.name;

    // fleet's variant
    const variant = req.body.variant;

    // Validates request
    validate(validationMode.invalidRequest, [manufacturerId, name]);

    // Mods the fleet
    const result = await executeQuery(
      client,
      'UPDATE fleet SET manufacturer_id = $1, name = $2, variant = $3 WHERE ID = $4 RETURNING *',
      [manufacturerId, name, variant, id]
    );

    // When the fleet was not found
    validate(validationMode.dataNotFound, [result.rows[0]]);

    // Returns edited fleet
    return result.rows[0];
  });
});

// Deletes the fleet
router.delete('/delete/:id', async (req, res) => {
  await transaction(res, async (client) => {
    // fleet's ID
    const id = req.params.id;

    // Deletes the fleet
    await executeQuery(client, 'DELETE FROM fleet WHERE ID = $1', [id]);

    // Returns success message
    return { result: 'Delete succeeded' };
  });
});

export default router;
