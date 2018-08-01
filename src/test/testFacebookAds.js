import * as test from 'unit.js';
import facebookAds from '../lib/facebookAd/';
import config from '../config';
import {Pool} from 'pg';

// Connection object
const cn = `postgres://${config.PGUSER}:${config.PGPASSWORD}@${config.PGHOST}:${config.PGPORT}/${config.PGDATABASE}?ssl=${config.PGSSL}`;

// Create a pool object
const pool = new Pool({
  connectionString: cn,
  idleTimeoutMillis: config.PG_CLIENT_IDLE_TIMEOUT,
});

let fb = facebookAds(config, pool);

const mockLibrary = true;
const originalFB = fb;

/**
 * Twitter library function testing harness
 * @param {Object} config - configuration object
 * @param {Bool} shim - Whether the facebook ads api should be shimmed
 *  (instead of making real calls to the sandbox)
 **/
export default function(config, shim) {
  before(function() {
    let success = () => {
      return new Promise((resolve, reject) => {
        resolve('API call was shimmed');
      });
    };

    let success1 = (nameOrId) => {
      return new Promise((resolve, reject) => {
        resolve(
          {
            success: 'API call to createAudience was shimmed',
            name: nameOrId,
            id: nameOrId,
          });
      });
    };

//    let fail = () => {
//      return new Promise((resolve, reject) => {
//        reject('API call to createAudience was shimmed');
//      });
//    };

    if (shim) {
      fb.createAudience = success;
      fb.createCampaign = success1; // one arg
      fb.getAllAdCreatives = success;
      fb.getAllAds = success;
      fb.getCampaignByName = success1; // one arg
      fb.getCampaignById = success1; // one arg
      fb.createAdSet = success; // 3 args
      fb.createAdByTyingAdCreativeAndAdSet = success; // 3 args
      fb.getAllAdSets = success;
      fb.getAdSetById = success1; // 1 arg

      fb.deleteCampaignById = success1; // 1 arg
      fb.deleteAdSetById = success;
      fb.deleteAdById = success;

      fb.saveAdCreativesToDB = success;
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
          campaignId = res.id;
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

    it('Get campaign by id fails', (done) => {
      fb.getCampaignById(campaignId)
        .then((res) => {
          test.value(res.name).is(TestCampaignName);
          test.value(res.id).is(campaignId);
          done();
        });
    });

    it('Delete facebook campaign fails', (done) => {
      fb.deleteCampaignById(campaignId)
        .then((res) => {
          test.value(res.success).is(true);
          done();
        });
    }).timeout(5000);

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
//                  'lng': 80.19,
//                  'lat': 12.93,
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
    it('Get all ads', function(done) {
      fb.getAllAds()
        .then((res) => {
          // if the promise was fulfilled, then the request was successful
          console.log(JSON.stringify(res));
          done();
        });
    });

    it('Get all creatives', (done) => {
      fb.getAllAdCreatives()
        .then((res) => {
          console.log(JSON.stringify(res));
          done();
        });
    });

    it('save all ad creatives to db', (done) => {
      console.log('SAVING AD CREATIVES');
      fb.saveAdCreativesToDB()
        .then((res) => {
          console.log(res);
          done();
        })
        .catch((err) => test.assert(false));
    });
  });

  /**
   * lib/facebookAds creates an AdSet
  **/
  describe.only('Facebook AdSets', () => {
    before(() => {
      // mock out the library functions we need:
      if ( mockLibrary ) {
        let adSetStore = {store: []};
        let campaignStore = {store: []};

        fb.createCampaign = (name) => new Promise((resolve, reject) => {
          // make a random id
          let id = Math.floor(Math.random()*(10000));
          let cam = {name: name, id: id};
          campaignStore.store.push(cam);
          resolve(cam);
        });
        fb.createAdSet = (name, camId, geo) =>
          new Promise((resolve, reject) => {
            let id = Math.floor(Math.random()*(10000));
            let obj = {name: name, camId: camId, geo: geo, id: id};
            adSetStore.store.push(obj);
            resolve(obj);
          });

        fb.getAdSetById = (id) => new Promise((resolve, reject) => {
          for (let item of adSetStore.store) {
            if (item.id === id) {
              resolve(item);
            }
          }
          reject('could not find adSet');
        });

        fb.createAdByTyingAdCreativeAndAdSet;
        fb.deleteAdSetById = (id) => new Promise((resolve, reject) => {
          // remove the adset with given id
          adSetStore.store.filter( (item) => item.id !== id);
          resolve({success: true});
        });

        fb.deleteCampaignById = (id) => new Promise((resolve, reject) => {
          // remove the adset with given id
          campaignStore.store.filter( (item) => item.id !== id);
          resolve({success: true});
        });
      }

      // let queryError = false;
      let parseError = false;
      // let adError = false;
      // const mockQuery = function(query, params) {
      //   return new Promise((resolve, reject) => {
      //     if (queryError === false) {
      //       resolve({rows: ['success']});
      //     } else {
      //       reject(new Error('query error'));
      //     }
      //   });
      // };
      // fb.pool.query = mockQuery;

      const mockParse = function(data, params, callback) {
        if (parseError === false) {
          callback(null, 'parse succesful');
        } else {
          callback(new Error('parse error'), {});
        }
      };
      fb.dbgeo.parse = mockParse;

      // const createAdMock = function(param, fields) {
      //   return new Promise((resolve, reject) => {
      //     if (adError === false) {
      //       resolve({'success': true});
      //     } else {
      //       reject(new Error('query error'));
      //     }
      //   });
      // };
      // fb.account.createAd = createAdMock;
    });

    after(() => {
      // reset all the functions we mocked
      fb = originalFB;
    });


    let adSetName = 'test AdSet 1';
    let campaignId;
    let adSetId;
    it('create empty AdSet fails', (done) => {
      fb.createCampaign('Test Campaign for AdSet 1')
        .then((campaign) => {
          // keep the id around so we can delete the campaign later
          campaignId = campaign.id;
          let geo = {
              'lat': 36.0,
              'lng': -121,
              'radius': '1',
          };
          fb.createAdSet(adSetName, campaign.id, geo)
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
      console.log(campaignId);
      fb.getAdSetById(adSetId)
        .then((res) => {
          test.value(res.name).is(adSetName);
          done();
        }).catch((err) => {
          // should be unable to find the adSet
          console.error(err);
          test.assert(false);
        });
    });


    it('tie existing creative to new adset', (done) => {
      let adCreativeId = 6075713088662;
      let geo = {
        'name': 'test',
        'lng': 80.19,
        'lat': 12.93,
        'radius': 10,
      };
      fb.createAdByTyingAdCreativeAndAdSet(adSetId, adCreativeId, geo)
        .then((adResponse) => {
          // make sure that this stuff is in the db
          const query = `SELECT id FROM ${fb.config.TABLE_OUTREACH_DATA}
                        WHERE fb_id=$1`;
          console.log(config.TABLE_OUTREACH_DATA);
          console.log(query);
          console.log('adResponse in Tying');
          console.log(adResponse.id);
          pool.query(query, [adResponse.id])
            .then((res) => {
              done();
            })
            .catch((err) => {
              console.log('CAUGHT ERRRRR');
              console.error(err);
              test.assert(false);
            });
        });
    }).timeout(15000);

    it('delete empty AdSet', (done) => {
      fb.deleteAdSetById(adSetId)
        .then((res) => {
          done();
        }).catch((err) => {
          console.error(err);
          test.assert(false);
        });
    }).timeout(15000);

    it('delete campaign created for AdSet', (done) => {
      fb.deleteCampaignById(campaignId)
        .then((res) => {
          test.value(res.success).is(true);
          done();
        });
    }).timeout(5000);

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

//  TODO doesn't work
//  describe('Create an ad', () => {
//    it('tie existing creative to new adset', (done) => {
//      let adSetId = 0;
//      let adCreativeId = 6075713090262;
//      fb.createAdByTyingAdCreativeAndAdSet(adSetId, adCreativeId)
//        .then( () => {
//          done();
//        });
//    });
//  });
}
