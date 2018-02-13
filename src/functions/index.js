require('dotenv').config();
import facebookAds from '../../lib/facebook/';

module.exports.buyFacebookGeolocationAd = (event, context, callback) => {
  let message = JSON.parse(event.Records[0].Sns.Message);
  console.log(message);
  let fb = facebookAds({});
  fb.createAudience();
  // Get geolocation from sns message
  // Create
};
