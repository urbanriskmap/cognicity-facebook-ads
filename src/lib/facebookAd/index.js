require('dotenv').config();
const adsSdk = require('facebook-nodejs-ads-sdk');
const Campaign = adsSdk.Campaign;
const GeoLocationAudience = adsSdk.TargetingGeoLocationCustomLocation;

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
          [Campaign.Fields.name]: 'Page likes campaign',
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


return methods;
}
