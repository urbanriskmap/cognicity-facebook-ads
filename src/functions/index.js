require('dotenv').config();

import {Pool} from 'pg';
import {handleResponse} from '../util/util';
import facebookAds from '../lib/facebookAd/index';

// Local objects
// TODO : make config file
import config from '../config';
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
module.exports.submitAdForApproval = (event, context, callback) => {
  // Catch database errors
  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
  });

  let message = JSON.parse(event.body);
  const fb = facebookAds(config, pool);
  console.log(message);
  // TODO document the message object (API docs anyone?)
  fb.createCampaign(message.name).then((cam)=> {
  fb.createAdSet(message.name, cam.id, message.geo)
    .then((adSetRes) => {
      const adCreativeId = message.adCreativeId; // test: 6075713088662;
      fb.createAdByTyingAdCreativeAndAdSet(
        adSetRes.id, adCreativeId, message.geo)
        .then((res) => {
          handleResponse(callback, 200, res);
          return;
        })
        .catch((err) => {
          // probably the audience was too small :(
          handleResponse(callback, 500, {error: err});
          console.error('Error Tying Ad Creative to AdSet');
        });
    }).catch((err) => {
      console.error(err);
    });
  }).catch((err) => {
    console.error('Error creating campaign');
    console.error(err);
  });
};

/**
 * Endpoint for sensor objects
 * @function getSensors
 * @param {Object} event - AWS Lambda event object
 * @param {Object} event.body - The body of the
 *                 request proxied by API gateway
 * @param {Object} context - AWS Lambda context object
 * @param {Object} callback - Callback (HTTP response)
 */
module.exports.getAdCreatives = (event, context, callback) => {
  const fb = facebookAds(config, pool);
  fb.getAllAdCreatives()
    .then((res) => {
      // get the image url
//      let getImages = (adCreatives) => new Promise((resolve, reject) => {
//        let hashes = [];
//        for (let adCreative of adCreatives) {
//          hashes.push(adCreative.image_hash);
//        }
//
//        fb.getImageUrlFromHashes(hashes)
//            .then((res) => {
//              // Now stick the url into the corresponding object
//              console.log('GOT URLS:');
//              for ( let i = 0; i++; i< adCreatives.length) {
//                adCreatives[i].image_link = res[i];
//              }
//              resolve(adCreatives);
//            }).catch((err) => reject(err));
//      });

      let creativesWithImg = [];
      // filter out the creatives that don't have images
      // (Mostly page boosting posts)
      for (let creative of res) {
        if (creative.image_hash) {
          creativesWithImg.push(creative);
        }
      }
      handleResponse(callback, 200, creativesWithImg);
      // wait for all images to be resolved
      // getImages(creativesWithImg)
      //   .then((finalRes) => handleResponse(callback, 200, finalRes));
    }).catch((err) => {
      handleResponse(callback, 500, null);
    });
};
