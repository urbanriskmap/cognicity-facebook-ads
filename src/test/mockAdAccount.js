// import adsSdk from 'facebook-nodejs-business-sdk';
import MockCampaign from './mockCampaign';
import MockAdSet from './mockAdSet';


/**
 * Mock constructor
 */
export default class MockAdAccount {
  /**
   * Mock constructor
   * @param {number} id
   */
  constructor(id) {
    this.id = id;
    this.campaignStore = [];
    this.adSetStore = [];
  }


  /**
   * Mock delete
   * @param {number} id
   * @param {object} fields
   * @return {Promise} promise
   */
  createCampaign(id, fields) {
    return new Promise((resolve, reject) => {
      // make a random id
      let id = Math.floor(Math.random()*(10000));
      let cam = new MockCampaign(id);

      this.campaignStore.push(cam);
      resolve(cam);
    });
  }

  /**
   * Mock createAdSet
   * @param {string[]} fields
   * @param {object} params
   * @return {Promise} promise
   */
  createAdSet(fields, params) {
    return new Promise((resolve, reject) => {
      let id = Math.floor(Math.random()*(10000));
      let obj = new MockAdSet(id);
      this.adSetStore.push(obj);
      resolve(obj);
    });
  }


  /**
   * Mock createAdSet
   * @param {string[]} fields
   * @param {object} params
   * @return {Promise} promise
   */
  createAd(fields, params) {
    return new Promise((resolve, reject) => {
      let id = Math.floor(Math.random()*(10000));
      let obj = {id: id};
      // this.adSetStore.push(obj);
      resolve(obj);
    });
  }

  /**
   * Mock getAds
   * @return {Promise} promise
   */
  getAds() {
    return new Promise((resolve, reject) => {
      resolve({});
    });
  }

  /**
   * Mock getAdCreatives
   * @param {string[]} fields
   * @param {object} params
   * @return {Promise} promise
   */
  getAdCreatives(fields, params) {
    return new Promise((resolve, reject) => {
      let adCreative = {
        id: 1234567,
        creative: {},
      };
      resolve([adCreative]);
    });
  }

  /**
   * Mock delete
   * @return {Promise} promise
   */
  delete() {
    return new Promise((resolve, reject) => {
      resolve({success: true});
    });
  }
}
