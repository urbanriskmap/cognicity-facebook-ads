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
  methods.account = new adsSdk.AdAccount(methods.accountId);

  methods.createAudience = () => new Promise((resolve, reject) => {
    methods.account
      .createCustomAudience(
        [GeoLocationAudience.Fields.Id],
        {
          [GeoLocationAudience.Fields.name]: 'geo located audience',
          [GeoLocationAudience.Fields.latitude]: 13.0827,
          [GeoLocationAudience.Fields.longitude]: 80.2707,
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
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const api = adsSdk.FacebookAdsApi.init(accessToken);
    api.setDebug(true);
    const accountId = process.env.FACEBOOK_ADACCOUNT_ID;
    const account = new adsSdk.AdAccount(accountId);
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
