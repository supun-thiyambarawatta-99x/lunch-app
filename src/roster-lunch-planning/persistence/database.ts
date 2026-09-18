import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const dataDirectory =
  process.env.LUNCH_DATA_DIR ??
  (process.env.VERCEL ? "/tmp" : join(process.cwd(), "data"));
mkdirSync(dataDirectory, { recursive: true });

export const database = new Database(
  join(dataDirectory, "lunch-ledger.sqlite"),
);
database.pragma("foreign_keys = ON");
database.exec(`
  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY,
    display_name TEXT NOT NULL,
    archived INTEGER NOT NULL DEFAULT 0
  );
  CREATE UNIQUE INDEX IF NOT EXISTS active_person_name
    ON people(display_name) WHERE archived = 0;
  CREATE TABLE IF NOT EXISTS lunch_days (
    id INTEGER PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    parcel_capacity INTEGER NOT NULL DEFAULT 2,
    final_parcel_order INTEGER,
    order_needs_reconfirmation INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS attendance (
    lunch_day_id INTEGER NOT NULL REFERENCES lunch_days(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES people(id),
    attending INTEGER NOT NULL,
    brings_home_food INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (lunch_day_id, person_id)
  );
  CREATE TABLE IF NOT EXISTS charges (
    id INTEGER PRIMARY KEY,
    lunch_day_id INTEGER NOT NULL REFERENCES lunch_days(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES people(id),
    display_name TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount >= 0),
    paid INTEGER NOT NULL DEFAULT 0,
    UNIQUE (lunch_day_id, person_id)
  );
  CREATE TABLE IF NOT EXISTS group_overrides (
    lunch_day_id INTEGER NOT NULL REFERENCES lunch_days(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES people(id),
    group_number INTEGER NOT NULL,
    PRIMARY KEY (lunch_day_id, person_id)
  );
`);
