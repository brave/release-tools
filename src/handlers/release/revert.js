/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var semver = require('semver')
var common = require('../../common')

async function run (args) {
  var args = require('yargs')
    .demand(['channel', 'version'])
    .describe('channel', 'channel identifier')
    .describe('version', 'verion in semver format (x.x.x)')
    .describe('platform', 'platform identifier')
    .argv
  common.channelCheck(args.channel)
  semver.valid(args.version) || common.nope(`Invalid version format ${args.version}`)
  if (args.platform) common.platformCheck(args.platform)
  var url
  if (args.platform) {
    url = '/api/1/control/releases/' + args.channel + '/' + args.platform + '/' + args.version
  } else {
    url = '/api/1/control/releases/' + args.channel + '/' + args.version
  }
  var requestOptions = common.requestOptions(url, 'DELETE')
  var response = await common.pr(requestOptions)
  return common.responseFormatter(response)
}

module.exports = run
