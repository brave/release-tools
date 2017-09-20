/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var common = require('../../../common')

async function pauseOrResumeChannelPlatform (channel, platform, action) {
  var options = platform ?
    common.requestOptions(`/api/1/control/releases/${action}/${channel}/${platform}`, 'PUT') :
    common.requestOptions(`/api/1/control/releases/${action}/${channel}`, 'PUT')
  return await common.pr(options)
}

module.exports = {
  pauseOrResumeChannelPlatform
}
