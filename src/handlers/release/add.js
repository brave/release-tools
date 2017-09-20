/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var common = require('../../common')
var semver = require('semver')
var _ = require('underscore')

async function run (args) {
  var args = require('yargs')
    .demand(['channel', 'version', 'notes'])
    .describe('channel', 'channel identifier')
    .describe('version', 'release version in semver format')
    .describe('notes', 'release notes')
    .describe('release', 'full release (not a preview)')
    .argv
  common.channelCheck(args.channel)
  semver.valid(args.version) || common.nope("invalid version format")

  args.preview = !args.release

  const BASE_URL = process.env.BASE_URL || 'https://brave-download.global.ssl.fastly.net/multi-channel/releases'

  const OSX_TEMPLATE = BASE_URL + '/CHANNEL/VERSION/osx/Brave-VERSION.zip'
  const LINUX64_TEMPLATE = BASE_URL + '/CHANNEL/VERSION/linux64/Brave.tar.bz2'

  var winx64_entry = {
    version: args.version,
    notes: args.notes,
    preview: args.preview
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

  var platforms = [
    ['winx64', winx64_entry],
    ['winia32', winia32_entry],
    ['osx', osx_entry],
    ['linux64', linux64_entry]
  ]

  return Promise.all(platforms.map(async (lst) => {
    var url = '/api/1/releases/' + args.channel + '/' + lst[0]
    var requestOptions = common.requestOptions(url, 'POST', lst[1])
    if (args.overwrite) {
      return common.responseFormatter(await common.pr(requestOptions))
    } else {
      return lst[1]
    }
  }))
  return ret
}

module.exports = run
