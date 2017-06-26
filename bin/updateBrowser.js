#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var util = require('util')
var semver = require('semver')
var async = require('async')
var r = require('request')

var channelData = require('../src/common').channelData
var platformData = require('../src/common').platformData
var nope = require('../src/common').nope

var args = require('yargs')
    .usage('Update browser-laptop release metadata files\n\nNote: Will not replace data files unless --overwrite flag set\n\nnode $0 --host=https://laptop-updates.brave.com --version=X.X.X --notes="release notes" --overwrite --channel=dev --release')
    .demand(['version', 'notes', 'channel', 'host'])
    .describe('channel', 'channel identifier {' + _.keys(channelData) +'}')
    .describe('version', 'version identifier (semver format)')
    .describe('notes', 'release notes')
    .describe('overwrite', 'flag controlling writing changes to data files')
    .describe('host', 'laptop updates hostname')
    .default('overwrite', false)
    .default('protocol', 'https')
    .argv

// check the channel names
if (!channelData[args.channel]) {
  nope('Invalid channel ' + args.channel)
}

// check the version format
if (!semver.valid(args.version)) {
  nope("Invalid version format, must be a numeric triple separated by periods (example - 0.4.2)")
}

// default preview to true (--release flag will override)
var preview = !args.release

const BASE_URL = process.env.BASE_URL || 'https://brave-download.global.ssl.fastly.net/multi-channel/releases'

const OSX_TEMPLATE = BASE_URL + '/CHANNEL/VERSION/osx/Brave-VERSION.zip'
const LINUX64_TEMPLATE = BASE_URL + '/CHANNEL/VERSION/linux64/Brave.tar.bz2'

var winx64_entry = {
  version: args.version,
  notes: args.notes,
  preview: preview
}
var winia32_entry = _.clone(winx64_entry)

var osx_entry = _.clone(winx64_entry)
osx_entry.url = OSX_TEMPLATE
osx_entry.url = osx_entry.url.replace(/VERSION/g, args.version)
osx_entry.url = osx_entry.url.replace(/CHANNEL/g, args.channel)

var linux64_entry = _.clone(winx64_entry)
linux64_entry.url = LINUX64_TEMPLATE
linux64_entry.url = linux64_entry.url.replace(/VERSION/g, args.version)
linux64_entry.url = linux64_entry.url.replace(/CHANNEL/g, args.channel)

var funcs = []
var host = args.host
if (args.port) host = host + ':' + args.port

async.eachSeries(
  [['winx64', winx64_entry],
   ['winia32', winia32_entry],
   ['osx', osx_entry],
   ['linux64', linux64_entry]],
  function (lst, cb) {
    console.log(lst[0])
    var options = {
      method: 'POST',
      url: args.protocol + '://' + host + '/api/1/releases/' + args.channel + '/' + lst[0],
      json: true,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.AUTH_TOKEN
      },
      body: lst[1]
    }
    r(options, function (err, results, body) {
      if (err || results.statusCode !== 200) {
        console.log("An error occurred will attempting to add " + lst[0])
        console.log(options)
        console.log(body)
        cb(body)
      } else {
        cb(null)
      }
    })
  }, function (err) {
    if (err) {
      console.log("Error!")
    } else {
      console.log("Done") 
    }
  }
)
