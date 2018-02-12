require('dotenv').config();

module.exports.buyFacebookGeolocationAd = (event, context, callback) => {
  let message = JSON.parse(event.Records[0].Sns.Message);
  console.log(message);
  // Get geolocation from sns message
  // Create
};
