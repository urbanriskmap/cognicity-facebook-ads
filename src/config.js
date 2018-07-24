/**
 * CogniCity Sensor Lambdas configuration
 * @file config.js
 * @return {Object} Configuration
**/

/* eslint-disable max-len */

require('dotenv').config({silent: true});

export default {
  API_KEY: process.env.API_KEY,
  ENDPOINT: process.env.ENDPOINT || 'https://sensors-dev.riskmap.us/',
  PGHOST: process.env.PGHOST || '127.0.0.1',
  PGDATABASE: process.env.PGDATABASE || 'cognicity',
  PGPASSWORD: process.env.PGPASSWORD || 'postgres',
  PGPORT: process.env.PGPORT || 5432,
  PGSSL: process.env.PGSSL === 'true' || false,
  PGTIMEOUT: process.env.PGTIMEOUT || 10000,
  PGUSER: process.env.PGUSER || 'postgres',
  PG_CLIENT_IDLE_TIMEOUT: process.env.PG_CLIENT_IDLE_TIMEOUT || 100,
  GEO_COLUMN: process.env.GEO_COLUMN || 'the_geom',
  TABLE_OUTREACH_METADATA: process.env.TABLE_OUTREACH_DATA || 'outreach.fb_data',
  GEO_SRID: process.env.GEO_SRID || 4326,
};
