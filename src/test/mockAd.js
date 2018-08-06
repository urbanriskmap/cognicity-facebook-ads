/**
 * Mock constructor
 */
export default class MockAd {
  /**
   * Mock constructor
   * @param {number} id
   */
  constructor(id) {
    this.id = id;
  }

  /**
   * Mock read
   * @param {object} properties
   * @return {Promise} promise
   */
  read(properties) {
    let ret = {id: this.id};
    return new Promise((resolve, reject) => {
      resolve(ret);
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
