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
          // if the promise was fulfilled, then the request was successful
          done();
        });
    });
 });

//  /**
//   * lib/facebookAds create a custom geo audience
//  **/
//  describe('Create a custom facebook audience', function() {
//    it('empty audience fails', function(done) {
//      const geo = {'name': 'test',
//                  'longitude': 80.19,
//                  'latitude': 12.93,
//                  'radius': 10};
//      fb.createAudience(geo)
//        .then((res) => {
//          // if the promise was fulfilled, then the request was successful
//          done();
//        });
//    });
//  });

  /**
   * lib/facebookAds gets all ads
  **/
  describe('get all ads', function() {
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
   * lib/facebookAds creates an AdSet
  **/
  describe('Create a facebook AdSet', function() {
    it('empty AdSet fails', (done) => {
      fb.createCampaign()
        .then((campaign) => {
          console.log('empty AdSet Campaign');
          console.log(campaign);
          fb.createAdSet('test AdSet 1', campaign.id)
            .then((res) => {
              console.log('Response');
              console.log(JSON.stringify(res));
              // if the promise was fulfilled, then the request was successful
              done();
            });
        });
    }).timeout(15000);
  });

  /**
   * lib/facebookAds deletes an ad based on name
  **/
  describe('get Campaign by name', function() {
    it('Get Campaign by name fails', function(done) {
      fb.getCampaignByName('test')
        .then((res) => {
          // if the promise was fulfilled, then the request was successful
          test.value(res[0]._data['name']).is('test');
          done();
        });
    });
  });
}
