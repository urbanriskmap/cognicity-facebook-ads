const dbgeo = require('dbgeo');
const adsSdk = require('facebook-nodejs-business-sdk');
const Campaign = adsSdk.Campaign;
const Ad = adsSdk.Ad;
const AdCreative = adsSdk.AdCreative;
const AdSet = adsSdk.AdSet;
const AdImage = adsSdk.AdImage;

/**
 * Object to directly interact with Facebook
 * @param {Object} config - constant parameters
 * @param {Object} pool - pg pool object
 * @return {Object} Function methods
 **/
export default function(config, pool) {
  let methods = {};

  methods.accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  // adsSdk.FacebookAdsApi.init(methods.accessToken);
  //
  // For debug mode
  const api = adsSdk.FacebookAdsApi.init(methods.accessToken);
  api.setDebug(true);
  methods.pool = pool;
  methods.config = config;
  methods.dbgeo = dbgeo;

  // TODO move this into config.js
  methods.accountId = process.env.FACEBOOK_ADACCOUNT_ID;
  methods.account = new adsSdk.AdAccount(methods.accountId);

  // This is so that we can easily mock the fb library in tests
  methods.Campaign = Campaign;
  methods.AdSet = AdSet;
  methods.Ad = Ad;
  methods.AdImage = AdImage;

  methods.createCampaign = (campaignName) =>
    new Promise((resolve, reject) => {
    methods.account
      .createCampaign(
        [Campaign.Fields.Id],
        {
          [Campaign.Fields.name]: campaignName,
          [Campaign.Fields.status]: Campaign.Status.paused,
          [Campaign.Fields.objective]: Campaign.Objective.page_likes,
        }
      )
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

  /**
   * Get first page of ad creatives
   * @return {Promise} the first page of adCreatives
   **/
  methods.getAllAdCreatives = () => new Promise((resolve, reject) => {
    methods.account
      .getAdCreatives(
        [AdCreative.Fields.name,
          AdCreative.Fields.image_hash,
          AdCreative.Fields.image_url,
          AdCreative.Fields.body,
        ],
        {
        }
      )
      .then((res) => {
        console.log('RES of get all ad creatives');
        console.log(JSON.stringify(res));
        const final = [];
        for (let each of res) {
          const obj = {
            message: each.body,
            name: each.name,
            id: each.id,
            image_hash: each.image_hash,
            image_url: each.image_url,
          };
          console.log('obj');
          console.log(obj);
          final.push(obj);
        }
        resolve(final);
      })
      .catch((err) => reject(err));
  });

  /**
   * Get corresponding permalink urls
   * @param {string[]} hashes - hashes of images
   * @return {string[]} permalink_url for those hashes
   **/
  methods.getImageUrlFromHashes = (hashes) =>
    new Promise((resolve, reject) => {
      methods.account.getAdImages(
        [methods.AdImage.Fields.permalink_url],
        {
          hashes: hashes,
        })
          .then((res) => {
            let allUrls = [];
            for (let each of res) {
              allUrls.push(each.permalink_url);
            }
            resolve(res);
          })
          .catch((err) => reject(err));
  });

  /**
   * Get first page of ads
   * @return {Promise} the first page of ads
   **/
  methods.getAllAds = () => new Promise((resolve, reject) => {
    methods.account
      .getAds(
        [Ad.Fields.name],
        {
        }
      )
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

  /**
   * Gets a facebook ad campaign by id
   * @param {number} campaignId - how wide, in kilometers to set the radius.
   * @return {Promise} resolved with campaign obj if fb responds with success
   **/
  methods.getCampaignById = (campaignId) => new Promise((resolve, reject) => {
    let cam = new methods.Campaign(campaignId);
    cam.read([Campaign.Fields.name])
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });

  /**
   * Creates an adset around a geo location returns promise
   * @param {string} name - name for this AdSet
   * @param {number} campaignId -the fb campaign under which
   *                            to create this adset
   * @param {Object} geo - object to indicate location
   * @param {number} geo.lat - latitude
   * @param {number} geo.lng - longitude
   * @param {number} geo.radius - how wide, in kilometers to set the radius.
   *  >= 1, <=80
   * @return {Promise} resolved if fb responds with success
   **/
  methods.createAdSet = (name, campaignId, geo) => new
      Promise((resolve, reject) => {
        // targeting geo: https://developers.facebook.com/docs/marketing-api/targeting-search#geo
    methods.account
      .createAdSet(
        [],
        {
          [AdSet.Fields.campaign_id]: campaignId,
          [AdSet.Fields.name]: name,
          [AdSet.Fields.targeting]: {
            'geo_locations': {
              'custom_locations': [
                {
                  'latitude': geo.lat.toString(),
                  'longitude': geo.lng.toString(),
                  'radius': geo.radius.toString(),
                  'distance_unit': 'kilometer',
                },
              ],
              'location_types': ['recent'],
            },
          },
          [AdSet.Fields.promoted_object]: {'page_id': 1993743780858389},
          [AdSet.Fields.bid_amount]: 1,
          [AdSet.Fields.daily_budget]: 100,
          [AdSet.Fields.status]: 'PAUSED',
          [AdSet.Fields.billing_event]: 'IMPRESSIONS',
          [AdSet.Fields.optimization_goal]: 'POST_ENGAGEMENT',
        }
      )
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

  methods.createAdByTyingAdCreativeAndAdSet
    = (adSetId, adCreativeId, geoData) => new Promise((resolve, reject) => {
      methods.account
        .createAd(
          [],
          {
            [Ad.Fields.name]: 'Test Ad',
            [Ad.Fields.adset_id]: adSetId,
            [Ad.Fields.status]: 'PAUSED',
            [Ad.Fields.creative]: {
              'creative_id': adCreativeId,
            },
          }
        ).then((res) => {
          const query = `INSERT INTO ${methods.config.TABLE_OUTREACH_DATA}
          (properties, ${methods.config.GEO_COLUMN}, f_key, fb_id)
          VALUES
              ($1, 
                  ST_Buffer(ST_SetSRID(ST_Point($2,$3),
                  ${methods.config.GEO_SRID})::geography,
                  $4)::geometry, 
               (
                 SELECT id FROM ${methods.config.TABLE_OUTREACH_METADATA}
                   WHERE fb_id=$5),
               $6
               )
          RETURNING id, created, properties, the_geom`;

          new methods.Ad(res.id)
            .read([Ad.Fields.name, Ad.Fields.tracking_specs])
            .then((adProperties) => {
              methods.pool.query(query,
                [adProperties, geoData.lng, geoData.lat,
                  geoData.radius, adCreativeId, adProperties.id])
                .then((result) => {
                  resolve(adProperties);
                })
                .catch((err) => reject(err));
            })
            .catch((err) => reject(err));
        });
    });

  methods.getAdSetById = (adSetId) =>
    new Promise((resolve, reject) => {
      let adSet = new methods.AdSet(adSetId);
      adSet.read([AdSet.Fields.name])
        .then((res) => resolve(res))
        .catch((err) => reject(err));
  });

  methods.deleteCampaignById
    = (campaignId) => new Promise((resolve, reject) => {
      new methods.Campaign(campaignId).delete()
         .then((result) => {
           resolve(result);
         }).catch((error) => {
           reject(error);
         });
  });

  methods.deleteAdSetById = (adSetId) => new Promise((resolve, reject) => {
    new methods.AdSet(adSetId).delete()
      .then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
  });

  methods.deleteAdById = (adId) => new Promise((resolve, reject) => {
    new methods.Ad(adId).delete()
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

  /**
   * Gets all existing adCreatives from fb and writes to db
   * TODO Only works if pagination is not required!
   * @return {Promise} resolves if all creatives fb responds with are in db
   **/
  methods.saveAdCreativesToDB = () =>
    new Promise((resolve, reject) => {
      const save = (creative) => {
        return new Promise((res, rej) => {
          if (creative.body) {
            const query = `INSERT INTO ${methods.config.TABLE_OUTREACH_METADATA}
          (fb_id, properties) 
          VALUES($1, $2) 
          RETURNING id, fb_id, properties`;

            methods.pool.query(query,
              [creative.id, creative])
              .then((result) => {
                res(result);
              })
              .catch((err) => rej(err));
          } else {
            resolve();
          }
        });
      };
      let allSaves = [];
      methods.getAllAdCreatives()
        .then((creatives) => {
          for (let creative of creatives) {
            allSaves.push(save(creative));
          }
          Promise.all(allSaves)
            .then( (val) => {
              resolve(val);
            })
            .catch((err) => {
              reject(err);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });

return methods;
}
