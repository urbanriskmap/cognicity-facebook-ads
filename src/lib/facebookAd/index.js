require('dotenv').config();

const adsSdk = require('facebook-nodejs-business-sdk');
const Campaign = adsSdk.Campaign;
const Ad = adsSdk.Ad;
const AdSet = adsSdk.AdSet;
const GeoLocationAudience = adsSdk.TargetingGeoLocationCustomLocation;


/**
 * Facebook ad campaigns: share business objective
 *    (like impressions/clicks )
 *  - AdSet1: share budget and targeting
 *    - Ad1: "click this"
 *    - Ad2: "report here"
 *    - Ad2: "chennai is flooding!"
 *  - AdSet2: different geo area
 *    - Ad1: "mumbai is flooding!"
 *
 *
 **/

/**
 * Object to directly interact with Facebook
 * @param {Object} config - twitter parameters
 * @return {Object} Function methods
 **/
export default function(config) {
  let methods = {};

  methods.accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const api = adsSdk.FacebookAdsApi.init(methods.accessToken);
  api.setDebug(true);
  methods.accountId = process.env.FACEBOOK_ADACCOUNT_ID;
  // methods.account = new adsSdk.AdAccount(methods.accountId);


  /**
   * Creates an audience based on geolocation
   * This is strictly for advertizing to users that have
   * interacted with us before
   * Currently unused since we can just fb message previous users
   * @param {Object} geoData
   *      {"latitude": , "longitude": , "radius": }
   * @return {Promise} resolved if fb responds with success
   **/
  methods.createAudience = (geoData) => new Promise((resolve, reject) => {
    let account = new adsSdk.AdAccount(methods.accountId);
    account
      .createCustomAudience(
        [GeoLocationAudience.Fields.Id],
        {

          [GeoLocationAudience.Fields.name]: geoData.name,
          [GeoLocationAudience.Fields.latitude]: geoData.latitude,
          [GeoLocationAudience.Fields.longitude]: geoData.longitude,
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

  methods.createCampaign = () => new Promise((resolve, reject) => {
    let account = new adsSdk.AdAccount(methods.accountId);
    account
      .createCampaign(
        [Campaign.Fields.Id],
        {
          [Campaign.Fields.name]: 'test',
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

  methods.getAllAds = () => new Promise((resolve, reject) => {
    let account = new adsSdk.AdAccount(methods.accountId);
    account
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
    let account = new adsSdk.AdAccount(methods.accountId);
    // TODO: need to manually filter by name
    account
      .getCampaigns(
        [Campaign.Fields.name],
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

  methods.createAdSet = (name, campaignId) => new
      Promise((resolve, reject) => {
    let account = new adsSdk.AdAccount(methods.accountId);
    account
      .createAdSet(
        [],
        {
          [AdSet.Fields.campaign_id]: campaignId,
          [AdSet.Fields.name]: 'test Ad Set',
          [AdSet.Fields.targeting]: {'geo_locations': {'countries': ['US']}},
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

  methods.getAdSetByName = (name) => new Promise((resolve, reject) => {
    let account = new adsSdk.AdAccount(methods.accountId);
    account
      .getAds(
        [AdSet.Fields.name],
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

  methods.getAdByName = (name) => new Promise((resolve, reject) => {
    let account = new adsSdk.AdAccount(methods.accountId);
    account
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
