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
      fb.createAudience = () => {
        return new Promise((resolve, reject) => {
          resolve('API call to createAudience was shimmed');
        });
      };
    }
  });


  /**
   * lib/facebookAd testing harness
  **/
  describe('Facebook Ad Campaigns', () => {
    const TestCampaignName = 'Test campaign';
    it('empty campaign fails', (done) => {
      fb.createCampaign(TestCampaignName)
        .then((res) => {
          // if the promise was fulfilled, then the request was successful
          done();
        });
    });

    it('Get facebook campaign by name fails', (done) => {
      fb.getCampaignByName(TestCampaignName)
        .then((res) => {
          done();
        });
    });

    it('Get Campaign by name fails', function(done) {
      fb.getCampaignByName(TestCampaignName)
        .then((res) => {
          console.log(JSON.stringify(res));
          // if the promise was fulfilled, then the request was successful
          test.value(res.name).is(TestCampaignName);
          done();
        });
    });

    it('Delete facebook campaign fails', (done) => {
      done();
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
      fb.createCampaign('Test Campaign for AdSet 1')
        .then((campaign) => {
          fb.createAdSet('test AdSet 1', campaign.id)
            .then((res) => {
              // if the promise was fulfilled, then the request was successful
              done();
            });
        });
    }).timeout(15000);
  });

  describe('Create an ad', (done) => {
    it('tie existing creative to new adset', () => {
      let adSetId = 0;
      let adCreativeId = 6075713090262;
      fb.createAdByTyingAdCreativeAndAdSet(adSetId, adCreativeId)
        .then( () => {
          done();
        });
    });
  });
}
