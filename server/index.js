import 'dotenv/config';
import express from 'express';
import { Pool } from 'pg';
import airlinesRouter from './routes/airlines.js';
import manufacturersRouter from './routes/manufacturers.js';

// Creates express application
const app = express();

// Binds middleware
// Lets express parse requests with JSON
app.use(express.json());
// Mounts the airlines router
app.use('/airlines', airlinesRouter);
// Mounts the manufacturers router
app.use('/manufacturers', manufacturersRouter);

// Express official website uses 3000
const port = 3000;

// Pool instance
export const pool = new Pool();

// Listens for connections
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
