#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var r = require('request')

var channelData = require('../src/common').channelData
var nope = require('../src/common').nope

var args = require('yargs')
    .usage('Promote preview version to release\n\nnode $0 --channel=dev --host=laptop-updates.brave.com --version=1.2.3')
    .demand(['channel', 'host', 'version'])
    .describe('channel', 'channel identifier {' + _.keys(channelData) +'}')
    .describe('host', 'hostname of the laptop browser update server')
    .describe('version', 'version number to promote')
    .default('port', 80)
    .default('protocol', 'https')
    .argv

// check the channel names
if (!channelData[args.channel]) {
  nope('Invalid channel ' + args.channel)
}

var options = {
  method: 'PUT',
  url: args.protocol + '://' + args.host + '/api/1/releases/' + args.channel + '/' + args.version + '/promote',
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
