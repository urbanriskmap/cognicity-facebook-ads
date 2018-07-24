require('dotenv').config();

import {Pool} from 'pg';
import facebookAds from '../../lib/facebook/';

// Local objects
// TODO : make config file
import config from '../../config';
// import {handleResponse} from '../../lib/util';

// Connection object
const cn = `postgres://${config.PGUSER}:${config.PGPASSWORD}@${config.PGHOST}:${config.PGPORT}/${config.PGDATABASE}?ssl=${config.PGSSL}`;

// Create a pool object
const pool = new Pool({
  connectionString: cn,
  idleTimeoutMillis: config.PG_CLIENT_IDLE_TIMEOUT,
});


// Some code taken under GPL3.0 from cognicity-sensors

/**
 * Endpoint for sensor objects
 * @function getSensors
 * @param {Object} event - AWS Lambda event object
 * @param {Object} event.body - The body of the
 *                 request proxied by API gateway
 * @param {Object} context - AWS Lambda context object
 * @param {Object} callback - Callback (HTTP response)
 */
module.exports.buyFacebookGeolocationAd = (event, context, callback) => {
  // Catch database errors
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
  });

  let message = JSON.parse(event.body);
  let fb = facebookAds(config, pool);
  console.log(message);
  // TODO document the message object (API docs anyone?)
  fb.createAdSet(message.name, message.campaignId, message.geo)
    .then((adSetRes) => {
      const adCreativeId = message.adCreativeId; // test: 6075713088662;
      fb.createAdByTyingAdCreativeAndAdSet(adSetRes, adCreativeId)
        .then((res) => {
          console.log(res);
          console.log(pool);
          // log in db that we created an Ad
        });
    }).catch((err) => {
      console.error(err);
    });
};
