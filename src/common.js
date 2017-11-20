/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var channelData = {
  dev: {},
  beta: {},
  stable: {},
  developer: {},
  nightly: {}
}

var platformData = {
  'osx': {},
  'winx64': {},
  'winia32': {},
  'linux64': {},
  'ubuntu64': {},
  'debian64': {},
  'fedora64': {},
  'openSUSE64': {},
  'redhat64': {},
  'mint64': {},
  'undefined': {},
  'linux': {}
}

var nope = function (msg) {
  console.log(msg)
  process.exit(1)
}

var makeVlog = function (argsv) {
  return (v, ...vargs) => argsv >= v && console.log(...vargs)
}

const capitalizeFirstLetter = (word) => {
  const firstLetter = word.charAt(0).toUpperCase()
  return firstLetter + word.slice(1)
}

const getChannelName = (os, channel) => {
  if (channel === 'dev') {
    return ''
  }
  switch (os) {
    case 'windows':
    case 'winx64':
    case 'winia32':
      return capitalizeFirstLetter(channel) + '-'
    case 'osx':
      return '-' + capitalizeFirstLetter(channel)
  }
  return '-' + channel
}

module.exports = {
  channelData,
  platformData,
  nope,
  makeVlog,
  getChannelName
}

