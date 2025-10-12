import { Router } from 'express';
import {
  executeQuery,
  noTransaction,
  transaction,
} from '../utils/executors.js';
import { validate, validationMode } from '../utils/validators.js';

// Express router
const router = Router();

// Get registration number and livery along with related information below.
// - airline name
// - airline color code
// - manufacturer name
// - fleet name
// - fleet variant
router.get('/get/:id', async (req, res) => {
  await noTransaction(res, async (client) => {
    // airlines_fleet id
    const id = req.params.id;

    // Get registration number, livery and other related information.
    const record = await executeQuery(
      client,
      `SELECT
      	airlines.name,
      	airlines.color_code,
      	manufacturers.name,
      	fleet.name,
      	fleet.variant,
      	airlines_fleet.registration,
      	airlines_fleet.livery
      FROM
      	airlines_fleet
      	LEFT OUTER JOIN airlines ON airlines_fleet.airline_id = airlines.id
      	LEFT OUTER JOIN fleet ON airlines_fleet.fleet_id = fleet.id
      	LEFT OUTER JOIN manufacturers ON fleet.manufacturer_id = manufacturers.id
      WHERE
      	airlines_fleet.ID = $1`,
      [id]
    );

    // When a record was not found
    validate(validationMode.dataNotFound, [record.rows[0]]);

    // returns a record
    return record.rows[0];
  });
});

// Get all airlines_fleet records along with other related information below.
// - airline name
// - airline color code
// - manufacturer name
// - fleet name
// - fleet variant
router.get('/get_all', async (req, res) => {
  await noTransaction(res, async (client) => {
    // Get records
    const records = await executeQuery(
      client,
      `SELECT
      	airlines.name,
      	airlines.color_code,
      	manufacturers.name,
      	fleet.name,
      	fleet.variant,
      	airlines_fleet.registration,
      	airlines_fleet.livery
      FROM
      	airlines_fleet
      	LEFT OUTER JOIN airlines ON airlines_fleet.airline_id = airlines.id
      	LEFT OUTER JOIN fleet ON airlines_fleet.fleet_id = fleet.id
      	LEFT OUTER JOIN manufacturers ON fleet.manufacturer_id = manufacturers.id`
    );

    // returns records
    return records.rows;
  });
});

// Add a record
router.post('/add', async (req, res) => {
  await transaction(res, async (client) => {
    // airline ID
    const airlineId = req.body.airline_id;

    // fleet ID
    const fleetId = req.body.fleet_id;

    // registration
    const registration = req.body.registration;

    // livery
    const livery = req.body.livery;

    // Validates request
    validate(validationMode.invalidRequest, [airlineId, fleetId, registration, livery]);

    // Add a record
    const record = await executeQuery(
      client,
      'INSERT INTO airlines_fleet (airline_id, fleet_id, registration, livery) VALUES ($1, $2, $3, $4) RETURNING *',
      [airlineId, fleetId, registration, livery]
    );

    // Returns added record
    return record.rows[0];
  });
});

// Mod the record
router.put('/mod/:id', async (req, res) => {
  await transaction(res, async (client) => {
    // airlines_fleet ID
    const id = req.params.id;

    // airline ID
    const airlineId = req.body.airline_id;

    // fleet ID
    const fleetId = req.body.fleet_id;

    // registration
    const registration = req.body.registration;

    // livery
    const livery = req.body.livery;

    // Validate request
    validate(validationMode.invalidRequest, [airlineId, fleetId, registration, livery]);

    // Mod the record
    const result = await executeQuery(
      client,
      'UPDATE airlines_fleet SET airline_id = $1, fleet_id = $2, registration = $3, livery = $4 WHERE ID = $5 RETURNING *',
      [airlineId, fleetId, registration, livery, id]
    );

    // When the record was not found
    validate(validationMode.dataNotFound, [result.rows[0]]);

    // Returns edited record
    return result.rows[0];
  });
});

// Deletes the record
router.delete('/delete/:id', async (req, res) => {
  await transaction(res, async (client) => {
    // ID
    const id = req.params.id;

    // Deletes the record
    await executeQuery(client, 'DELETE FROM airlines_fleet WHERE ID = $1', [id]);

    // Returns success message
    return { result: 'Delete succeeded' };
  });
});

export default router;
