/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
  Verification checks for updater configuration and file location / status
*/

var common = require('../../common')
var semver = require('semver')
var _ = require('underscore')
var request = require('request')
var url = require('url')

// Verify (via HEAD call) that a file exists at a url, throw if not
async function verifyUrl (url, msg, args={}) {
  options = {
    method: "HEAD",
    url: url
  } 
  var response = await common.pr(options)
  if (response.statusCode === 200) {
    console.log('  OK ... ' + url)
  } else {
    console.log('HTTP Status code: ' + response.statusCode, 'url: ', url)
    if (args.warn) {
      console.log('  FAILED ... ' + msg + ' : ' + url)
    } else {
      throw new Error(msg + ' : ' + url)
    }
  }
}

async function run (args) {
  var args = require('yargs')
    .demand(['channel', 'version'])
    .describe('channel', 'channel identifier')
    .describe('version', 'release version in semver format')
    .describe('warn', 'issue a warning (instead of failing) when a file does not exist')
    .default('warn', false)
    .argv
  common.channelCheck(args.channel)
  semver.valid(args.version) || common.nope("invalid version format")

  var versionMetadata = (await common.pr(common.requestOptions(`/api/1/releases/${args.channel}?version=${args.version}`))).body

  // make the list of (single) release per platform 
  var versionMetadata = _.map(versionMetadata, (v, k) => { return { platform: k, release: v[0] } })
  var versionMetadataIdx = _.object(_.map(versionMetadata, (lst) => { return [ lst.platform, lst.release ] }))

  // Verify files from json url
  for (var i = 0; i < versionMetadata.length; i++) {
    var meta = versionMetadata[i]
    var release = meta.release 
    if (release.url && release.version) {
      await verifyUrl(release.url, release.url + ' could not be found', args)
      // osx
      if (release.url.match(/osx/)) {
        var parsed = url.parse(release.url)
        var urlPath = parsed.path.split('/')
        urlPath = urlPath.slice(0, urlPath.length - 1).join('/')
        await verifyUrl(parsed.protocol + '//' + parsed.hostname + urlPath + '/Brave-' + release.version + '.dmg', 'Brave dmg not found', args)
      }
    }
  }

  // Set allowing override for testing
  var BASE_URL = process.env.BASE_URL || 'https://brave-download.global.ssl.fastly.net/multi-channel/releases'

  // Verify Windows x64 files
  var winx64_url = BASE_URL + '/' + args.channel + '/' + 'winx64'
  var response = await common.pr({ url: winx64_url + '/RELEASES' })
  console.log('    ' + response.body)
  if (response.statusCode === 200) {
    console.log('  OK ... ' + winx64_url + '/RELEASES')
    var filename = response.body.split(' ')[1]
    await verifyUrl(winx64_url + '/' + filename, 'Windows update file ' + filename + ' is not available at ' + winx64_url + '/' + filename, args)
  } else {
    throw new Error(winx64_url + ' could not be found')
  }
  await verifyUrl(winx64_url + '/BraveSetup-x64.exe', 'BraveSetup-x64.exe not found', args)

  // Verify Windows ia32 files
  var winia32_url = BASE_URL + '/' + args.channel + '/' + 'winia32'
  var response = await common.pr({ url: winia32_url + '/RELEASES'})
  console.log('    ' + response.body)
  if (response.statusCode === 200) {
    console.log('  OK ... ' + winia32_url + '/RELEASES')
    var filename = response.body.split(' ')[1]
    await verifyUrl(winia32_url + '/' + filename, 'Windows update file ' + filename + ' is not available at ' + winia32_url + '/' + filename, args)
  } else {
    throw new Error(winia32_url + ' could not be found')
  }
  await verifyUrl(winia32_url + '/BraveSetup-ia32.exe', 'BraveSetup-ia32.exe not found', args)

  // Verify the versioned Windows x64 files
  var version = args.version 
  var winx64_version_url = BASE_URL + '/' + args.channel + '/' + version + '/winx64/'
  await verifyUrl(winx64_version_url + 'BraveSetup-x64.exe', 'Versioned BraveSetup-x64.exe not found for winx64 version ' + version, args)

  // Verify the versioned Windows ia32 files
  var winia32_version_url = BASE_URL + '/' + args.channel + '/' + version + '/winia32/'
  await verifyUrl(winia32_version_url + 'BraveSetup-ia32.exe', 'Versioned BraveSetup-ia32.exe not found for ia32 version ' + version, args)

  // Verify the versioned Linux files
  var linux64_version_url = BASE_URL + '/' + args.channel + '/' + version
  await verifyUrl(linux64_version_url + '/debian64/brave_' + version + '_amd64.deb', 'debian file not found for version ' + version, args)
  await verifyUrl(linux64_version_url + '/fedora64/brave-' + version + '.x86_64.rpm', 'fedora file not found for version ' + version, args)
  return { status: 200 }
}

module.exports = run
