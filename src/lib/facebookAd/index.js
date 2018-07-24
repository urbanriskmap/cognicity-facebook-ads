const dbgeo = require('dbgeo');
const adsSdk = require('facebook-nodejs-business-sdk');
const Campaign = adsSdk.Campaign;
const Ad = adsSdk.Ad;
const AdCreative = adsSdk.AdCreative;
const AdSet = adsSdk.AdSet;
const GeoLocationAudience = adsSdk.TargetingGeoLocationCustomLocation;

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

  methods.accountId = process.env.FACEBOOK_ADACCOUNT_ID;
  methods.account = new adsSdk.AdAccount(methods.accountId);

  /**
   * Creates an audience based on geolocation
   * This is strictly for advertizing to users that have
   * interacted with us before
   * Currently unused since we can just fb message previous users
   * @param {Object} geoData
   * @param {number} geoData.lat
   * @param {number} geoData.lng
   * @param {number} geoData.radius
   * @return {Promise} resolved if fb responds with success
   **/
  methods.createAudience = (geoData) => new Promise((resolve, reject) => {
    methods.account
      .createCustomAudience(
        [GeoLocationAudience.Fields.Id],
        {
          [GeoLocationAudience.Fields.name]: geoData.name,
          [GeoLocationAudience.Fields.latitude]: geoData.lat,
          [GeoLocationAudience.Fields.longitude]: geoData.lng,
          [GeoLocationAudience.Fields.radius]: geoData.radius,
          subtype: 'CUSTOM',
          customer_file_source: 'USER_PROVIDED_ONLY',
        }
      )
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

  methods.createCampaign = (campaignName) => new Promise((resolve, reject) => {
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

  methods.getAllAdCreatives = () => new Promise((resolve, reject) => {
    methods.account
      .getAdCreatives(
        [AdCreative.Fields.name],
        {
        }
      )
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });

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


  methods.getCampaignByName = (name) => new Promise((resolve, reject) => {
    methods.account
      .getCampaigns(
        [Campaign.Fields.name],
        {
          'name': name,
        }
      )
      .then((result) => {
        for (let cam of result) {
          if (cam.name === name) {
            resolve(cam);
          }
        }
        reject(new Error('Campaign with name ' + name + ' not found'));
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
    let cam = new Campaign(campaignId);
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
                  'latitude': geo.location.lat.toString(),
                  'longitude': geo.location.lng.toString(),
                  'radius': geo.location.radius.toString(),
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

  // TODO : not filled in- might not need it
  methods.createAdCreative = (name, campaignId) => new
      Promise((resolve, reject) => {
    methods.account
      .createAdCreative(
        [],
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
          // put an empty obj into the fb_data table.
          const query = `INSERT INTO ${methods.config.TABLE_OUTREACH_METADATA}
          (properties, ${methods.config.GEO_COLUMN})
          VALUES
              ($1, ST_Buffer(ST_SetSRID(ST_Point($2,$3),
              ${methods.config.GEO_SRID})::geography,
              $4)::geometry)
          RETURNING id, created, properties, the_geom`;

          const params = {
            outputFormat: methods.config.GEO_FORMAT_DEFAULT,
            geometryColumn: methods.config.GEO_COLUMN,
            geometryType: 'wkb',
            precision: methods.config.GEO_PRECISION,
          };
          console.log(query);
          console.log(methods.db);
          let properties = {
            adSetId: adSetId,
            adCreativeId: adCreativeId,
          };

          methods.pool.query(query,
            [properties, geoData.lng, geoData.lat, geoData.radius])
            .then((result) => {
              console.log('MAKING QUERY TO INSERT GEODATA');
              dbgeo.parse(result.rows, params, (err, parsed) => {
                if (err) {
                  reject(err);
                }
                resolve(parsed);
              });
            })
            .catch((err) => reject(err));
        });
    });

  methods.getAllAdSets = (name) => new Promise((resolve, reject) => {
    methods.account
      .getAdSets(
        [AdSet.Fields.name],
        {}
      )
      .then((res) => resolve(res))
      .catch((err) => reject(err));
  });

  methods.getAdSetById = (campaignId, adSetId) =>
    new Promise((resolve, reject) => {
      let adSet = new AdSet(adSetId);
      adSet.read([AdSet.Fields.name])
        .then((res) => resolve(res))
        .catch((err) => reject(err));
  });

  methods.getAdByName = (name) => new Promise((resolve, reject) => {
    methods.account
      .getAds(
        [Ad.Fields.name],
        {
          'name': name,
        }
      )
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

  methods.deleteCampaignById
    = (campaignId) => new Promise((resolve, reject) => {
      new Campaign(campaignId).delete()
         .then((result) => {
           resolve(result);
         }).catch((error) => {
           reject(error);
         });
  });

  methods.deleteAdSetById = (adSetId) => new Promise((resolve, reject) => {
    new AdSet(adSetId).delete()
      .then((result) => {
        resolve(result);
      }).catch((error) => {
        reject(error);
      });
  });

  // TODO fix this.
  methods.deleteAdById = (adId) => new Promise((resolve, reject) => {
    let ad = new adsSdk.Ad(adId);
    delete ad.then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });

return methods;
}
