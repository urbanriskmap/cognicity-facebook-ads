import request from 'request';

/*
 * Twitter object for direct message interactions
 */

// Global Twitter credentials object
const config = {
  oauth: {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    token: process.env.TWITTER_ACCESS_TOKEN_KEY,
    token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  },
};

/**
  * Prepares Twitter message request object
  * @function _prepareRequest
  * @param {Object} body - message body object
  * @return {Object} - Twitter message request object
  */
const _prepareRequest = function(body) {
  let requestOptions = {
    url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
    oauth: config.oauth,
    json: true,
    headers: {
      'content-type': 'application/json',
    },
    body: body,
  };
  // Log the message
  console.log('Outgoing DMessage object: ' + JSON.stringify(body));

  return requestOptions;
};

/**
 * Send direct Twitter message
 * @function sendMessage
 * @param {Object} body - Twitter direct message body object
 * @return {Object} - Response object from Twitter
 **/
const sendMessage = (body) => new Promise((resolve, reject) => {
  let opts = _prepareRequest(body);
  // Send the message
  request.post(opts, function(error, response, body) {
    if (!error) {
      resolve(response);
    } else {
      console.log(response);
      reject(error);
    }
  });
});
export default () => ({_prepareRequest, sendMessage});
