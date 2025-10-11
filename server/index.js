import 'dotenv/config';
import express from 'express';
import { Pool } from 'pg';
import airlinesRouter from './routes/airlines.js';
import manufacturersRouter from './routes/manufacturers.js';
import fleetRouter from './routes/fleet.js';
import locationRouter from './routes/location.js';
import { logger } from './utils/logger.js';

// Creates express application
const app = express();

// Binds middleware
// Lets express parse requests with JSON
app.use(express.json());
// Logs time and requested url
app.use('/', logger);
// Mounts the airlines router
app.use('/airlines', airlinesRouter);
// Mounts the manufacturers router
app.use('/manufacturers', manufacturersRouter);
// Mounts the fleet router
app.use('/fleet', fleetRouter);
// Mounts the location router
app.use('/location', locationRouter);

// Express official website uses 3000
const port = 3000;

// Pool instance
export const pool = new Pool();

// Listens for connections
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
