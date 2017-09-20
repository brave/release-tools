#!/usr/bin/env node

var tap = require('tap')
var request = require('request')

var exec = require('child_process').exec
var execAsync = require('async-child-process').execAsync

async function pr (options) {
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(response)
      }
    })
  })
}

function standardURL () {
  return "http://localhost:9000"
}

function standardOptions () {
  return {
    method: "GET",
    url: standardURL() ,
    json: true,
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.AUTH_TOKEN
    }
  }
}

function nope (msg) {
  console.log(msg)
  process.exit(1)
}

async function metadataCheck(channel, platform, version, acceptPreview) {
  acceptPreview = (typeof acceptPreview === 'undefined') ? 'false' : acceptPreview.toString()
  var options = standardOptions()
  options.url = options.url + `/1/releases/${channel}/${version}/${platform}?accept_preview=${acceptPreview}`
  var results = await pr(options)
  return results 
}

async function refresh () {
  var options = standardOptions()
  options.url += '/api/1/releases/refresh'
  options.method = 'PUT'
  var results = await pr(options)
  return results
}

var AUTH_TOKEN = process.env.AUTH_TOKEN || nope("AUTH_TOKEN must be defined")

tap.test("Integration tests", (top) => {
  top.test("Insert a live release", async (t) => {
    var cmd = `AUTH_TOKEN=${AUTH_TOKEN} ./bin/updateBrowser.js --channel=dev --host=localhost:9000 --protocol=http --version=0.7.0 --notes=foo --release`
    var result = await execAsync(cmd)
    t.ok(result.stdout.match(/Done/), "Release added")
    result = await metadataCheck('dev', 'osx', '0.6.0')
    t.equal(result.statusCode, 204, 'no releases available yet')
    result = await refresh() 
    result = await metadataCheck('dev', 'osx', '0.6.0', false)
    t.equal(result.body.version, '0.7.0', 'release available now')
    t.end()
  })
  top.test("Insert a preview release", async (t) => {
    var cmd = `AUTH_TOKEN=${AUTH_TOKEN} ./bin/updateBrowser.js --channel=dev --host=localhost:9000 --protocol=http --version=0.8.0 --notes=foo`
    var result = await execAsync(cmd)
    t.ok(result.stdout.match(/Done/), "Release added")
    result = await refresh() 
    result = await metadataCheck('dev', 'osx', '0.6.0', false)
    t.equal(result.body.version, '0.7.0', 'live release available now')
    result = await metadataCheck('dev', 'osx', '0.6.0', true)
    t.equal(result.body.version, '0.8.0', 'preview release available now')
    t.end()
  })
  top.test("Promote preview release", async (t) => {
    var cmd = `AUTH_TOKEN=${AUTH_TOKEN} ./bin/promotePreview.js --channel=dev --host=localhost:9000 --protocol=http --version=0.8.0 --notes=fooupdate`
    var result = await execAsync(cmd)
    result = await refresh() 
    result = await metadataCheck('dev', 'osx', '0.7.0', false)
    t.equal(result.body.version, '0.8.0', 'Promoted release available now')
    t.equal(result.body.notes, 'fooupdate', 'Notes updates for promoted release')
    t.end()
  })
  top.end()
})

