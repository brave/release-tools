#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var _ = require('underscore')

var nope = require('../src/common').nope

// noun / verb handlers
var cmds = {
  'release': {
    'add': {
      handler: require('../src/handlers/release/add'),
      description: "Add a new versioned browser release"
    },
    'promote': {
      handler: require('../src/handlers/release/promote'),
      description: "Promote an existing release to a live release"
    },
    'revert': {
      handler: require('../src/handlers/release/revert'),
      description: "Revert (delete) an exiting release"
    },
    'pause': {
      handler: require('../src/handlers/release/pause'),
      description: "Pause a channel or a channel / platform combination"
    },
    'resume': {
      handler: require('../src/handlers/release/resume'),
      description: "Resume a channel or channel / platform pause"
    },
    'verify': {
      handler: require('../src/handlers/release/verify'),
      description: "Verify browser binaries are in the correct location via a series of HEAD requests"
    },
    'upload': {
      handler: () => {},
      description: "Upload browser binaries for a platform"
    }
  }
}

function usage () {
  console.log(`./release-control.js noun verb [args]\n`)
  _.each(cmds, (verbs, noun) => {
    console.log(noun)
    _.each(verbs, (obj, verb) => {
      console.log(`  ${verb} - ${obj.description}`)
    })
  })
  console.log(`\nExample\n  ./release-control.js release promote --channel=dev --platform=osx --notes="release notes"`)
  console.log(`\n(To see documentation for a specific noun/verb execute it without params)`)
  process.exit(1)
}

var args = require('yargs').argv

// check for required environment variables
process.env.AUTH_TOKEN || nope('AUTH_TOKEN environment variable required')
process.env.HOST || nope('HOST environment variable required')
process.env.PROTOCOL || nope('PROTOCOL environment variable required')

var noun = args._[0]
var verb = args._[1]

if (args._.length === 0 || !cmds[noun] || !cmds[noun][verb]) {
  usage()
}

async function main (noun, verb, args) {
  try {
    console.log(await cmds[noun][verb].handler(args))
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
}

main(noun, verb, args)
