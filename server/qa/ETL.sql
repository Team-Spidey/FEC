-- psql zach -h 127.0.0.1 -d qa -f ETL.sql

DROP TABLE IF EXISTS questions;
CREATE TABLE questions (
  question_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  question_body VARCHAR(500) NULL DEFAULT NULL,
  question_date BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP),
  asker_name VARCHAR(100) NULL DEFAULT NULL,
  email VARCHAR(100),
  reported INT NULL DEFAULT NULL,
  question_helpfulness INTEGER NULL DEFAULT NULL
);

DROP TABLE IF EXISTS answers;
CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  body VARCHAR(500) NULL DEFAULT NULL,
  date BIGINT DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP),
  answerer_name VARCHAR(50) NULL DEFAULT NULL,
  answerer_email VARCHAR(50),
  reported INTEGER,
  helpfulness INTEGER NULL DEFAULT NULL
);

DROP TABLE IF EXISTS photos;
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  answer_id INTEGER NOT NULL,
  url VARCHAR(500) NULL DEFAULT NULL
);

\COPY questions FROM '/Users/zacaharykessler/Downloads/questions.csv' DELIMITER ',' CSV HEADER;

\COPY answers FROM '/Users/zacaharykessler/Downloads/answers.csv' DELIMITER ',' CSV HEADER;

\COPY photos FROM '/Users/zacaharykessler/Downloads/answers_photos.csv' DELIMITER ',' CSV HEADER;

-- ALTER TABLE answers ADD FOREIGN KEY (question_id) REFERENCES questions (question_id);
-- ALTER TABLE answers ADD FOREIGN KEY (photos) REFERENCES photos (id);