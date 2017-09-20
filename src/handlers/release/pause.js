/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var common = require('../../common')
var pauseResume = require('./lib/pauseResume')

async function run (args) {
  var args = require('yargs')
    .demand(['channel'])
    .describe('channel', 'channel identifier')
    .describe('platform', 'platform identifier')
    .argv
  common.channelCheck(args.channel)
  if (args.platform) common.platformCheck(args.platform)
  var response = await pauseResume.pauseOrResumeChannelPlatform(args.channel, args.platform, 'pause')
  return common.responseFormatter(response)
}

module.exports = run
