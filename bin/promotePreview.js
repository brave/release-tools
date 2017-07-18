#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')
var _ = require('underscore')

var channelData = require('../src/common').channelData
var nope = require('../src/common').nope

var args = require('yargs')
    .usage('Promote preview version to release\n\nNote: Will not replace data files unless --overwrite flag set\n\nnode $0 --overwrite --channel=dev --notes="optional update to the notes"')
    .demand(['channel', 'location'])
    .describe('channel', 'channel identifier {' + _.keys(channelData) +'}')
    .describe('location', 'location to the data directory within a vault-updater repo')
    .describe('overwrite', 'flag controlling writing changes to data files')
    .describe('notes', 'release notes')
    .default('overwrite', false)
    .argv

// check the channel names
if (!channelData[args.channel]) {
  nope('Invalid channel ' + args.channel)
}

var dataPath = args.location
console.log(path.join(dataPath, 'dev', 'osx.json'))
// check that the location exists
if (!fs.existsSync(path.join(dataPath, 'dev', 'osx.json'))) {
  nope("Release data files do not exists within " + args.location)
}

var platforms = ['osx', 'winia32', 'winx64', 'linux64']
var json = {}

platforms.forEach((platformName) => {
  json[platformName] = JSON.parse(fs.readFileSync(path.join(dataPath, args.channel, platformName + '.json')))
  var metadata = json[platformName][0]
  if (!!!metadata.preview) {
    console.log("Error: version " + metadata.version + " of " + platformName + " already promoted to release version")
    process.exit(1)
  } else {
    metadata.preview = false
    if (args.notes) metadata.notes = args.notes
  }
  console.log(metadata)
  if (args.overwrite) {
    fs.writeFileSync(path.join(dataPath, args.channel, platformName + '.json'), JSON.stringify(json[platformName], null, 2))
  }
})

if (!args.overwrite) {
  console.log("Warning: nothing written to disk. Use --overwrite flag to write changes.")
}
console.log("Done")
