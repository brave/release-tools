/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var r = require('request')

var channelData = {
  dev: {},
  beta: {},
  stable: {},
  developer: {},
  nightly: {}
}

var platformData = {
  'osx': {},
  'winx64': {},
  'winia32': {},
  'linux64': {},
  'ubuntu64': {},
  'debian64': {},
  'fedora64': {},
  'openSUSE64': {},
  'redhat64': {},
  'mint64': {},
  'undefined': {},
  'linux': {}
}

function requestOptions (url, method='GET', body=null) {
  return {
    method: method,
    url: process.env.PROTOCOL + '://' + process.env.HOST + url,
    json: true,
    body: body,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.AUTH_TOKEN
    }
  }
}

async function pr (options) {
  return new Promise((resolve, reject) => {
    r(options, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(response)
      }
    })
  })
}

var nope = function (msg) {
  console.log(msg)
  process.exit(1)
}

var makeVlog = function (argsv) {
  return (v, ...vargs) => argsv >= v && console.log(...vargs)
}

function channelCheck (channelId) {
  channelData[channelId] || nope(`Invalid channel ${channelId}`)
}

function platformCheck (platformId) {
  platformData[platformId] || nope(`Invalid platform ${platformId}`)
}

function responseFormatter (response) {
  if (response.body) {
    if (!response.body.statusCode) {
      response.body.statusCode = response.statusCode
    }
    return response.body
  } else {
    return { statusCode: response.statusCode }
  }
}

module.exports = {
  channelData: channelData,
  platformData: platformData,
  nope: nope,
  makeVlog: makeVlog,
  channelCheck: channelCheck,
  platformCheck: platformCheck,
  requestOptions: requestOptions,
  pr: pr,
  responseFormatter: responseFormatter
}

