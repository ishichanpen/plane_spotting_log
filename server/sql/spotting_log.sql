CREATE TABLE spotting_log (
  id SERIAL PRIMARY KEY,
  airlines_fleet_id INT REFERENCES airlines_fleet(id) ON DELETE SET NULL,
  location_id INT REFERENCES location(id) ON DELETE SET NULL,
  spotted_time TIMESTAMP WITH TIME ZONE NOT NULL,
  comment TEXT
);
