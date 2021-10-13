#!/usr/bin/env node

import {formatInvalidMarkdownLink} from './format'
import {gitLsFiles} from './git'

import {parse_markdown_links_from_file} from './parse-markdown-links'
import {SUGGEST_MIN_DISTANCE, suggestPath} from './suggest-path'
import {LinkValidity, valid_link} from './validate-link'

import chalk from 'chalk'

import * as process from 'process'
import * as yargs from 'yargs'

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
    .parserConfiguration({'parse-numbers': false})
    .strict()
    .parseSync()
  const files = cmdLineArguments._ as string[]
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
      if (error instanceof Error) {
        console.error(`Error caught processing ${file}: ${error.message}`)
      } else {
        console.error(`Error caught processing ${file}: ${error}`)
      }
      exitCode = 1
    }
  }
  process.exit(exitCode)
}

run()
