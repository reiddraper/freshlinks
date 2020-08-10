#!/usr/bin/env node

import {parse_markdown_links_from_file} from './parse-markdown-links'
import {formatInvalidMarkdownLink} from './format'
import {valid_link, LinkValidity} from './validate-link'
import * as yargs from 'yargs'
import * as process from 'process'

async function run(): Promise<void> {
  const args = yargs.argv._
  let exitCode = 0
  for (const file of args) {
    try {
      const links = await parse_markdown_links_from_file(file)
      for (const link of links) {
        const valid = await valid_link(link)
        if (valid === LinkValidity.Invalid) {
          // there's probably a better way to only set this once,
          // but :shrug:
          exitCode = 1
          console.log(formatInvalidMarkdownLink(link))
        }
      }
    } catch (error) {
      console.error(`Error caught processing ${file}: ${error.message}`)
      exitCode = 1
    }
  }
  console.log(`Exit code is ${exitCode}`)
  process.exit(exitCode)
}

run()
