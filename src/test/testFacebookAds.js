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
    let campaignId;
    const TestCampaignName = 'Test campaign- should be deleted';
    it('empty campaign fails', (done) => {
      fb.createCampaign(TestCampaignName)
        .then((res) => {
          // if the promise was fulfilled, then the request was successful
          done();
        });
    });

    it('Get Campaign by name fails', function(done) {
      fb.getCampaignByName(TestCampaignName)
        .then((res) => {
          // if the promise was fulfilled, then the request was successful
          test.value(res.name).is(TestCampaignName);
          campaignId = res.id;
          done();
        });
    });

    it('Delete facebook campaign fails', (done) => {
      fb.deleteCampaignById(campaignId)
        .then((res) => {
          test.value(res.success).is(true);
          done();
        });
    });

    it('Should be unable to find Campaign after deltion', (done) => {
      fb.getCampaignByName(TestCampaignName)
        .then((res) => {
          test.assert(false);
        })
        .catch((err) => {
          // we got an error, great
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
          // if the promise was fulfilled, then the request was successful
          done();
        });
    });
  });


  /**
   * lib/facebookAds creates an AdSet
  **/
  describe('Facebook AdSets', () => {
    let adSetName = 'test AdSet 1';
    let campaignId;
    let adSetId;
    it('create empty AdSet fails', (done) => {
      fb.createCampaign('Test Campaign for AdSet 1')
        .then((campaign) => {
          // keep the id around so we can delete the campaign later
          campaignId = campaign.id;
          fb.createAdSet(adSetName, campaign.id)
            .then((res) => {
              adSetId = res.id;
              // if the promise was fulfilled, then the request was successful
              done();
            });
        })
        .catch((err) => test.assert(false)
        );
    }).timeout(15000); // takes longer because it's two calls

    it('read adSet', (done) => {
      fb.getAdSetById(campaignId, adSetId)
        .then((res) => {
          test.value(res.name).is(adSetName);
          done();
        }).catch((err) => {
          // should be unable to find the adSet
          console.error(err);
          test.assert(false);
        });
    });

    it('delete empty AdSet', (done) => {
      fb.deleteAdSetById(adSetId)
        .then((res) => {
          done();
        }).catch((err) => {
          console.error(err);
          test.assert(false);
        });
    }).timeout(15000);

    it('make sure AdSet is gone', (done) => {
      fb.getAdSetById(adSetId)
        .then((res) => {
          console.error(res);
          test.assert(false);
        }).catch((err) => {
          // should be unable to find the adSet
          done();
        });
    });
  });

  describe('Create an ad', () => {
    it('tie existing creative to new adset', (done) => {
      let adSetId = 0;
      let adCreativeId = 6075713090262;
      fb.createAdByTyingAdCreativeAndAdSet(adSetId, adCreativeId)
        .then( () => {
          done();
        });
    });
  });
}
