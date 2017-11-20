#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var fs = require('fs')
var path = require('path')
var _ = require('underscore')
var util = require('util')
var semver = require('semver')

const {channelData, platformData, getChannelName} = require('../src/common')
var nope = require('../src/common').nope

var args = require('yargs')
    .usage('Update browser-laptop release metadata files\n\nNote: Will not replace data files unless --overwrite flag set\n\nnode $0 --location=../../vault-updater/data --version=X.X.X --notes="release notes" --overwrite --channel=dev --release')
    .demand(['version', 'notes', 'channel', 'location'])
    .describe('channel', 'channel identifier {' + _.keys(channelData) +'}')
    .describe('version', 'version identifier (semver format)')
    .describe('notes', 'release notes')
    .describe('overwrite', 'flag controlling writing changes to data files')
    .describe('location', 'location of the data directory within a vault-updater repo')
    .default('overwrite', false)
    .argv

// check the channel names
if (!channelData[args.channel]) {
  nope('Invalid channel ' + args.channel)
}

// check the version format
if (!semver.valid(args.version)) {
  nope("Invalid version format, must be a numeric triple separated by periods (example - 0.4.2)")
}

var dataPath = args.location
// check that the location exists
if (!fs.existsSync(path.join(dataPath, 'dev', 'osx.json'))) {
  nope("Release data files do not exists within " + args.location)
}

// default preview to true (--release flag will override)
var preview = !args.release

const BASE_URL = process.env.BASE_URL || 'https://brave-download.global.ssl.fastly.net/multi-channel/releases'

const OSX_TEMPLATE = BASE_URL + '/CHANNEL/VERSION/osx/Brave{{channelName}}-VERSION.zip'
const LINUX64_TEMPLATE = BASE_URL + '/CHANNEL/VERSION/linux64/Brave{{channelName}}.tar.bz2'

var winx64_entry = {
  version: args.version,
  name: 'Brave ' + args.version,
  pub_date: (new Date()).toISOString(),
  notes: args.notes,
  preview: preview
}
var winia32_entry = _.clone(winx64_entry)

var osx_entry = _.clone(winx64_entry)
osx_entry.url = OSX_TEMPLATE
                  .replace(/VERSION/g, args.version)
                  .replace(/CHANNEL/g, args.channel)
                  .replace('{{channelName}}', getChannelName('osx', args.channel))

var linux64_entry = _.clone(winx64_entry)
linux64_entry.url = LINUX64_TEMPLATE
                      .replace(/VERSION/g, args.version)
                      .replace(/CHANNEL/g, args.channel)
                      .replace('{{channelName}}', getChannelName('linux', args.channel))

var winia32_json = JSON.parse(fs.readFileSync(path.join(dataPath, args.channel, 'winia32.json')))
var winx64_json = JSON.parse(fs.readFileSync(path.join(dataPath, args.channel, 'winx64.json')))
var osx_json = JSON.parse(fs.readFileSync(path.join(dataPath, args.channel, 'osx.json')))
var linux64_json = JSON.parse(fs.readFileSync(path.join(dataPath, args.channel, 'linux64.json')))

// Check for valid version
_.each(osx_json, function (metadata) {
  if (semver.compare(metadata.version, args.version) === 0) {
    nope("Error: requested version " + args.version + " already exists")
  }
})
if (osx_json.length > 0 && semver.compare(args.version, osx_json[0].version) === -1) {
  nope("Error: requested version " + args.version + " is lower than the current version " + osx_json[0].version)
}

// Add the new entries
winia32_json.unshift(winia32_entry)
winx64_json.unshift(winx64_entry)
osx_json.unshift(osx_entry)
linux64_json.unshift(linux64_entry)

var inspectContents = function (label, last) {
  return '*** ' + label + ' *** \n' + util.inspect(last) + '\n'
}

console.log("Latest contents for channel " + args.channel)
console.log(inspectContents('winia32', winia32_json[0]))
console.log(inspectContents('winx64', winx64_json[0]))
console.log(inspectContents('osx', osx_json[0]))
console.log(inspectContents('linux64', linux64_json[0]))

if (args.overwrite) {
  console.log("Writing data files for channel " + args.channel)
  fs.writeFileSync(path.join(dataPath, args.channel, 'winia32.json'), JSON.stringify(winia32_json, null, 2))
  fs.writeFileSync(path.join(dataPath, args.channel, 'winx64.json'), JSON.stringify(winx64_json, null, 2))
  fs.writeFileSync(path.join(dataPath, args.channel, 'osx.json'), JSON.stringify(osx_json, null, 2))
  fs.writeFileSync(path.join(dataPath, args.channel, 'linux64.json'), JSON.stringify(linux64_json, null, 2))
} else {
  console.log("Warning: nothing written to disk. Use --overwrite flag to write changes.")
}

console.log("Done")
