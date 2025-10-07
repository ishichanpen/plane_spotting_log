import { Router } from "express";
import { executeQuery, noTransaction, transaction } from "../utils/executors.js";
import { validate, validationMode } from "../utils/validators.js";

// Express router
const router = Router();

router.get('/get/:id', async (req, res) => {
  await noTransaction(res, async (client) => {
    // Manufacturer's ID
    const id = req.params.id;

    // Gets the manufacturer
    const manufacturer = await executeQuery(
      client,
      'SELECT * FROM manufacturers WHERE ID = $1',
      [id],
    );

    // When the manufacturer was not found
    validate(validationMode.dataNotFound, [manufacturer.rows[0]]);

    // returns the manufacturer
    return manufacturer.rows[0];
  });
});

// Gets all manufacturers
router.get('/get_all', async (req, res) => {
  await noTransaction(res, async (client) => {
    // Gets manufacturers
    const manufacturers = await executeQuery(
      client,
      'SELECT * FROM manufacturers ORDER BY ID',
    );

    // returns manufacturers
    return manufacturers.rows;
  });
});

// Adds an manufacturer
router.post('/add', async (req, res) => {
  await transaction(res, async (client) => {
    // manufacturer's name
    const name = req.body.name;

    // Validates request
    validate(validationMode.invalidRequest, [name]);

    // Adds an manufacturer
    const manufacturer = await executeQuery(
      client,
      'INSERT INTO manufacturers (name) VALUES ($1) RETURNING *',
      [name],
    );

    // Returns added manufacturer
    return manufacturer.rows[0];
  });
});

// Mods the manufacturer
router.put('/mod/:id', async (req, res) => {
  await transaction(res, async (client) => {
    // manufacturer's ID
    const id = req.params.id;

    // manufacturer's name
    const name = req.body.name;

    // Validates request
    validate(validationMode.invalidRequest, [name]);

    // Mods the manufacturer
    const result = await executeQuery(
      client,
      'UPDATE manufacturers SET name=$1 WHERE ID = $2 RETURNING *',
      [name, id],
    );

    // When the manufacturer was not found
    validate(validationMode.dataNotFound, [result.rows[0]]);

    // Returns edited manufacturer
    return result.rows[0];
  });
});

// Deletes the manufacturer
router.delete('/delete/:id', async (req, res) => {
  await transaction(res, async (client) => {
    // manufacturer's ID
    const id = req.params.id;

    // Deletes the manufacturer
    await executeQuery(
      client,
      'DELETE FROM manufacturers WHERE ID = $1',
      [id],
    );

    // Returns success message
    return {result: 'Delete succeeded'};
  });
});

export default router;
