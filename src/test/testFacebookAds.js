require('dotenv').configure;

// import * as test from 'unit.js';
import facebookAds from '../lib/facebookAd/';

/**
 * Twitter library function testing harness
 * @param {Object} config - configuration object
 **/
export default function(config) {
  /**
   * lib/twitter testing harness
  **/
  describe('Create a facebook audience', function() {
    it('empty audience fails', function(done) {
      facebookAds(config).createAudience()
        .then((res) => {
          console.log('Response');
          console.log(JSON.stringify(res));
          // if the promise was fulfilled, then the request was successful
          done();
        });
    });
 });
}
