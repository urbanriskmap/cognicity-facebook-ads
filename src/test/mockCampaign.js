import * as adsSdk from 'facebook-nodejs-business-sdk';

const Cam = adsSdk.Campaign;
/**
 * Mock constructor
 */
export default class MockCampaign {
  /**
   * Mock constructor
   * @param {number} id
   */
  constructor(id) {
    this.Fields = Cam.Fields;
    this.id = id;
  }

  /**
   * Mock read
   * @param {object} fields
   * @return {Promise} auto resolves
   */
  read( fields) {
    return new Promise((resolve, reject) => {
      console.log(fields);
      resolve();
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
