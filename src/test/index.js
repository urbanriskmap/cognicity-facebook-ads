/* eslint-disable no-console */
/**
 * Unit tests for CogniCity Twitter DM Lambda
 * @file Runs unit tests for CogniCity Twitter DM Lambda
 *
 * Tomas Holderness June 2017
 * Abraham Quintero July 2018
 */

// Unit tests
import testFacebookAds from './testFacebookAds';
import config from '../config';

// Shim the api if env variable is set
testFacebookAds(config, (process.env.SHIM === 'true'));
