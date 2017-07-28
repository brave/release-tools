#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var request = require('request')
var args = require('yargs')
    .usage('Create Heroku App to parse specific version crash reports for Muon / Browser-Laptop\n\nnode $0 --location=../../vault-updater/data --version=X.X.X')
    .demand(['version'])
    .describe('version', 'version identifier (semver format)')
    .describe('bucket', 'S3 bucket name')
    .defaults('send', false)
    .argv

args.bucket = args.bucket || 'brave-laptop-crash-reports'

const requiredKeys = ['S3_CRASH_KEY', 'S3_CRASH_SECRET', 'DATABASE_URL', 'AMQP_URL', 'AUTH_TOKEN']
requiredKeys.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.log('Environment variable ' + envVar + ' required')
    process.exit(1)
  }
})

const contents = {
  app: {
    name: 'crash-parser-' + args.version.replace(new RegExp('\\.', 'g'), '-')
  },
  source_blob: {
    url: "https://github.com/brave/vault-crash-parser/tarball/master/"
  },
  overrides: {
    env: {
      BRAVE_VERSIONS: args.version,
      S3_CRASH_KEY: process.env.S3_CRASH_KEY, 
      S3_CRASH_SECRET: process.env.S3_CRASH_SECRET, 
      S3_CRASH_BUCKET: args.bucket, 
      MQ_VERSION: args.version,
      DATABASE_URL: process.env.DATABASE_URL, 
      AMQP_URL: process.env.AMQP_URL 
    }
  }
}

console.log(contents)

const options = {
  url: 'https://api.heroku.com/app-setups',
  method: 'POST',
  json: true,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/vnd.heroku+json; version=3",
    "Authorization": "Bearer " + process.env.AUTH_TOKEN
  },
  body: contents
} 

if (args.send) {
  request(options, (err, response, body) => {
    console.log(body)
  }) 
} else {
  console.log("Warning: nothing done. Use --send argument to build app on Heroku")
}

