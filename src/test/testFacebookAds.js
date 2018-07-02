require('dotenv').configure;

import * as test from 'unit.js';
import facebookAds from '../lib/facebookAd/';

let fb = facebookAds({});
/**
 * Twitter library function testing harness
 * @param {Object} config - configuration object
 * @param {Bool} shim - Whether the facebook ads api should be shimmed
 *  (instead of making real calls to the sandbox)
 **/
export default function(config, shim) {
  before(function() {
    if (shim) {
      fb.createAudience = function() {
        return new Promise(function(resolve, reject) {
          resolve('API call to createAudience was shimmed');
        });
      };
    }
  });


  /**
   * lib/twitter testing harness
  **/
  describe('Create a facebook campaign with above audience', function() {
    it('empty campaign fails', function(done) {
      fb.createCampaign()
        .then((res) => {
          console.log('Response');
          console.log(JSON.stringify(res));
          // if the promise was fulfilled, then the request was successful
          done();
        });
    });
 });

  /**
   * lib/facebookAds create a custom geo audience
  **/
  describe('Create a facebook audience', function() {
    it('empty audience fails', function(done) {
      const geo = {'name': 'test',
                  'longitude': 80.19,
                  'latitude': 12.93,
                  'radius': 10};
      fb.createAudience(geo)
        .then((res) => {
          console.log('Response');
          console.log(JSON.stringify(res));
          // if the promise was fulfilled, then the request was successful
          done();
        });
    });
  });

  /**
   * lib/facebookAds gets all ads
  **/
  describe('Create a facebook audience', function() {
    it('empty audience fails', function(done) {
      fb.getAllAds()
        .then((res) => {
          console.log('Response');
          console.log(JSON.stringify(res));
          // if the promise was fulfilled, then the request was successful
          done();
        });
    });
  });

  /**
   * lib/facebookAds deletes an ad based on name
  **/
  describe('get ad by name', function() {
    it('Get ad by name fails', function(done) {
      fb.getAdByName('test')
        .then((res) => {
          console.log('Response to getAdByName');
          console.log(JSON.stringify(res[0]));
          // if the promise was fulfilled, then the request was successful
          test.value(res[0]._data['name']).is('test');
          done();
        });
    });
  });
}
