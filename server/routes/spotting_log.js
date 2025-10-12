import { Router } from 'express';
import {
  executeQuery,
  noTransaction,
  transaction,
} from '../utils/executors.js';
import { validate, validationMode } from '../utils/validators.js';

// Express router
const router = Router();

// Get the spotting log along with other related information
router.get('/get/:id', async (req, res) => {
  await noTransaction(res, async (client) => {
    // log ID
    const id = req.params.id;

    // Get the spotting log
    const log = await executeQuery(
      client,
      `SELECT
      	spotting_log.id,
      	airlines.name AS airline_name,
      	airlines.color_code,
      	manufacturers.name AS manufacturer_name,
      	fleet.name AS fleet_name,
      	fleet.variant,
      	airlines_fleet.registration,
      	airlines_fleet.livery,
      	location.latitude,
      	location.longitude,
      	spotting_log.spotted_time,
      	spotting_log.comment
      FROM
      	spotting_log
      	LEFT OUTER JOIN airlines_fleet ON spotting_log.airlines_fleet_id = airlines_fleet.id
      	LEFT OUTER JOIN airlines ON airlines_fleet.airline_id = airlines.id
      	LEFT OUTER JOIN fleet ON airlines_fleet.fleet_id = fleet.id
      	LEFT OUTER JOIN manufacturers ON fleet.manufacturer_id = manufacturers.id
      	LEFT OUTER JOIN location ON spotting_log.location_id = location.id
      WHERE spotting_log.id = $1`,
      [id]
    );

    // When the spotting log was not found
    validate(validationMode.dataNotFound, [log.rows[0]]);

    // return the spotting log
    return log.rows[0];
  });
});

// Get all spotting logs
router.get('/get_all', async (req, res) => {
  await noTransaction(res, async (client) => {
    // Gets spotting logs
    const logs = await executeQuery(
      client,
      `SELECT
      	spotting_log.id,
      	airlines.name AS airline_name,
      	airlines.color_code,
      	manufacturers.name AS manufacturer_name,
      	fleet.name AS fleet_name,
      	fleet.variant,
      	airlines_fleet.registration,
      	airlines_fleet.livery,
      	location.latitude,
      	location.longitude,
      	spotting_log.spotted_time,
      	spotting_log.comment
      FROM
      	spotting_log
      	LEFT OUTER JOIN airlines_fleet ON spotting_log.airlines_fleet_id = airlines_fleet.id
      	LEFT OUTER JOIN airlines ON airlines_fleet.airline_id = airlines.id
      	LEFT OUTER JOIN fleet ON airlines_fleet.fleet_id = fleet.id
      	LEFT OUTER JOIN manufacturers ON fleet.manufacturer_id = manufacturers.id
      	LEFT OUTER JOIN location ON spotting_log.location_id = location.id`,
    );

    // return spotting logs
    return logs.rows;
  });
});

// Add a spotting log
router.post('/add', async (req, res) => {
  await transaction(res, async (client) => {
    // airlines_fleet ID
    const airlinesFleetId = req.body.airlines_fleet_id;

    // location ID
    const locationId = req.body.location_id;

    // spotted time
    const spottedTime = req.body.spotted_time;

    // comment
    const comment = req.body.comment;

    // Validates request
    validate(validationMode.invalidRequest, [airlinesFleetId, locationId, spottedTime, comment]);

    // Add a spotting log
    const log = await executeQuery(
      client,
      'INSERT INTO spotting_log (airlines_fleet_id, location_id, spotted_time, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [airlinesFleetId, locationId, spottedTime, comment]
    );

    // Returns added spotting log
    return log.rows[0];
  });
});

// Mod the spotting log
router.put('/mod/:id', async (req, res) => {
  await transaction(res, async (client) => {
    // ID
    const id = req.params.id;

    // airlines_fleet ID
    const airlinesFleetId = req.body.airlines_fleet_id;

    // location ID
    const locationId = req.body.location_id;

    // spotted time
    const spottedTime = req.body.spotted_time;

    // comment
    const comment = req.body.comment;

    // Validates request
    validate(validationMode.invalidRequest, [airlinesFleetId, locationId, spottedTime, comment]);

    // Mod the spotting log
    const result = await executeQuery(
      client,
      'UPDATE spotting_log SET airlines_fleet_id = $1, location_id = $2, spotted_time = $3, comment = $4 WHERE ID = $5 RETURNING *',
      [airlinesFleetId, locationId, spottedTime, comment, id]
    );

    // When the spotting log was not found
    validate(validationMode.dataNotFound, [result.rows[0]]);

    // Returns edited spotting log
    return result.rows[0];
  });
});

// Delete the spotting log
router.delete('/delete/:id', async (req, res) => {
  await transaction(res, async (client) => {
    // ID
    const id = req.params.id;

    // Delete the spotting log
    await executeQuery(client, 'DELETE FROM spotting_log WHERE ID = $1', [id]);

    // Returns success message
    return { result: 'Delete succeeded' };
  });
});

export default router;
