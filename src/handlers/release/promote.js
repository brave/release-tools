/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var yargs = require('yargs')
var semver = require('semver')
var common = require('../../common')

async function run (args) {
  var args = require('yargs')
    .demand(['channel', 'version'])
    .describe('channel', 'channel identifier')
    .describe('version', 'version in semver format (x.x.x)')
    .describe('platform', 'platform identifier')
    .describe('notes', 'updated releases notes')
    .argv
  common.channelCheck(args.channel)
  semver.valid(args.version) || common.nope(`Invalid version format ${args.version}`)
  if (args.platform) common.platformCheck(args.platform)

  var body = args.notes ? { notes: args.notes } : {}
  var url = args.platform ?
    `/api/1/control/releases/promote/${args.channel}/${args.platform}/${args.version}` :
    `/api/1/control/releases/promote/${args.channel}/${args.version}`
  var requestOptions = common.requestOptions(url, 'PUT', body)
  var response = await common.pr(requestOptions)
  return common.responseFormatter(response)
}

module.exports = run 
