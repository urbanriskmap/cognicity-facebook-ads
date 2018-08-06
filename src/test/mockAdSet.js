/**
 * Mock AdSet
 */
export default class MockAdSet {
  /**
   * Mock constructor
   * @param {number} id
   */
  constructor(id) {
    this.id = id;
  }

  /**
   * Mock read
   * @param {object} fields
   * @return {Promise} promise
   */
  read(fields) {
    return new Promise((resolve, reject) => {
      resolve(this.id);
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
