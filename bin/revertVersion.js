#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var r = require('request')

var channelData = require('../src/common').channelData
var platformData = require('../src/common').platformData
var nope = require('../src/common').nope
var url

var args = require('yargs')
    .usage('Revert version\n\nnode $0 --channel=dev --host=laptop-updates.brave.com --version=1.2.3')
    .demand(['channel', 'host', 'version'])
    .describe('channel', 'channel identifier {' + _.keys(channelData) +'}')
    .describe('host', 'hostname of the laptop browser update server')
    .describe('version', 'version number to promote')
    .describe('platform', 'optional platform identifier')
    .default('port', 80)
    .default('protocol', 'https')
    .argv

// check the channel name
if (!channelData[args.channel]) {
  nope('Invalid channel ' + args.channel)
}

// check the platform name
if (args.platform && !platformData[args.platform]) {
  nope('Invalid platform ' + args.platform)
}

if (args.os) {
  url = args.protocol + '://' + args.host + '/api/1/releases/' + args.channel + '/' + args.platform + '/' + args.version,
} else {
  url = args.protocol + '://' + args.host + '/api/1/releases/' + args.channel + '/' + args.version,
}

var options = {
  method: 'DELETE',
  url: url,
  json: true,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.AUTH_TOKEN
  }
}

r(options, function (err, results, body) {
  if (err) {
    console.log(err.toString())
  } else {
    console.log(body)
  }
})
