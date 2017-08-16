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
    .usage('Change channel status\n\nnode $0 --channel=dev --host=laptop-updates.brave.com --status=pause')
    .demand(['channel', 'host', 'status'])
    .describe('channel', 'channel identifier {' + _.keys(channelData) +'}')
    .describe('host', 'hostname of the laptop browser update server')
    .describe('status', 'new status for channel')
    .default('port', 80)
    .default('protocol', 'https')
    .choices('status', ['pause', 'resume'])
    .argv

// check the channel name
if (!channelData[args.channel]) {
  nope('Invalid channel ' + args.channel)
}

var base = args.protocol + '://' + args.host
if (args.port) base += ':' + args.port

var options = {
  method: 'PUT',
  url: base + '/api/1/control/releases/' + args.status + '/' + args.channel,
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
