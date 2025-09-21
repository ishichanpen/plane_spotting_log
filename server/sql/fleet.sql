CREATE TABLE fleet (
  id SERIAL PRIMARY KEY,
  manufacturer_id INT NOT NULL REFERENCES manufacturers(id) ON DELETE CASCADE,
  name VARCHAR(20) NOT NULL,
  variant VARCHAR(20)
);
