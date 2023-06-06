 CREATE TABLE branches ( 
  array_id INT,
  branch VARCHAR(250),
  city VARCHAR(250),
  duration INT,
  frequency VARCHAR(250),
  google_link VARCHAR(250),
  lat NUMERIC(23, 18),
  lng NUMERIC(23, 18),
  name VARCHAR(250),
  project VARCHAR(250)
);
CREATE TABLE masterlist_branches (
    id SERIAL PRIMARY KEY NOT NULL,
    project VARCHAR(250) NOT NULL,
    branch VARCHAR(250),
    city VARCHAR(250) NOT NULL,
    google_link VARCHAR,
    lat NUMERIC(23, 18) NOT NULL,
    long NUMERIC(23, 18) NOT NULL,
    frequency VARCHAR(250) NOT NULL,
    duration INT
);
alter table branches add column created_at timestamp; 