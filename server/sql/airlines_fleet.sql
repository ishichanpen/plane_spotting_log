CREATE TABLE airlines_fleet (
  id SERIAL PRIMARY KEY,
  airline_id INT NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
  fleet_id INT NOT NULL REFERENCES fleet(id) ON DELETE CASCADE,
  registration VARCHAR(20) NOT NULL,
  livery TEXT
);
