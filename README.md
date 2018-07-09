[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](http://www.gnu.org/licenses/gpl-3.0) [![Build Status](https://travis-ci.org/urbanriskmap/twitter-dm-bot-lamda.svg?branch=master)](https://travis-ci.org/urbanriskmap/twitter-dm-bot-lamda) [![Coverage Status](https://coveralls.io/repos/github/urbanriskmap/twitter-dm-bot-lamda/badge.svg?branch=dev)](https://coveralls.io/github/urbanriskmap/twitter-dm-bot-lamda?branch=dev)

## Lambdas to buy geographic Facebook advertisement

## The topology of Facebook Advertizing

+ Facebook ad campaigns: share business objective (like impressions/clicks )
    - AdSet1: share budget and targeting
    - Ad1:
    - Links AdCreative("click this") + AdSet("run 10am-2pm")
    - Ad2: "report here"
    - Ad2: "chennai is flooding!"
+ AdSet2: different geo area
    - Ad1: "mumbai is flooding!"

More info: https://developers.facebook.com/docs/marketing-api/buying-api#ad-creative



## Making app roles that can create advertisements
- Go to [facebook business settings](https://business.facebook.com/settings?business_id=1862027380754769)
- then System Users -> add, create an user and add the pages that you will be advertising.
- Make a new token and use that as the authentication token for Facebook. The account stays as Urban Risk Lab USA (act_82415076)

### Building
Built in ES6, compiled with Babel, deployed to AWS Lambda using Serverless.
Run
`npm run build`

### Tests
Run unit tests (mocha + unit) and ESLint
`npm test`

### Contributing
- Issues tracked on GitHub
- Master currently deployed version, use dev branch for new features
- Note
  * design pattern notes below
  * note release process notes below

### Release process
- update the CHANGELOG.md file with newly released version, date and high-level overview of changes. Commit the change.
- Create a tag in git from current head of master. The tag version should be the same as the version specified in the package.json file - this is the release version.
- Update the version in the package.json file and commit the change - this is a new version.
- Further development is now on the updated version number until the release process begins again.

### Design Patterns
- functions that make external calls should return a promise
- internal methods can be simple functions
- functionality should be testable without excessive mocking
- Use JSDoc comments throughout
