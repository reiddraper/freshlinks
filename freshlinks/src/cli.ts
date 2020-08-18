#!/usr/bin/env node

import {parse_markdown_links_from_file} from './parse-markdown-links'
import {formatInvalidMarkdownLink} from './format'
import {valid_link, LinkValidity} from './validate-link'
import {suggestPath, SUGGEST_MIN_DISTANCE} from './suggest-path'
import {gitLsFiles} from './git'
import * as yargs from 'yargs'
import * as process from 'process'
import chalk from 'chalk'

async function run(): Promise<void> {
  const cmdLineArguments = yargs
    .options({
      suggestions: {
        type: 'boolean',
        default: true,
        describe:
          'When a broken link is detected, suggest a potential fix by considering the files stored in the Git repository. Note, this must be run in a Git repository for this functionality to work.'
      }
    })
    .strict().argv
  const files = cmdLineArguments._
  let exitCode = 0

  let possibleLinkDestinations: string[]
  if (cmdLineArguments.suggestions) {
    possibleLinkDestinations = await gitLsFiles()
  } else {
    possibleLinkDestinations = []
  }

  for (const file of files) {
    try {
      const links = await parse_markdown_links_from_file(file)
      for (const link of links) {
        const valid = await valid_link(link)
        if (valid === LinkValidity.Invalid) {
          // there's probably a better way to only set this once,
          // but :shrug:
          exitCode = 1
          console.log(formatInvalidMarkdownLink(link))
          if (cmdLineArguments.suggestions) {
            const [suggestion, distance] = suggestPath(
              link.sourceFile,
              link.link,
              possibleLinkDestinations
            )

            // Don't suggest matches that are too far away from the original
            // link
            if (distance <= SUGGEST_MIN_DISTANCE) {
              console.log(`Perhaps you meant: ${chalk.blue(suggestion)}`)
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error caught processing ${file}: ${error.message}`)
      exitCode = 1
    }
  }
  process.exit(exitCode)
}

run()
