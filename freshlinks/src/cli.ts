#!/usr/bin/env node

import {parse_markdown_links_from_file} from './parse-markdown-links'
import {formatMarkdownLink} from './format'
import {valid_link} from './validate-link'
import {argv} from 'process'

async function run(): Promise<void> {
  for (const file of argv.slice(2)) {
    try {
      const links = await parse_markdown_links_from_file(file)
      for (const link of links) {
        const valid = await valid_link(link)
        console.info(formatMarkdownLink(link, valid))
      }
    } catch (error) {
      console.error(`Error caught processing ${file}: ${error.message}`)
    }
  }
}

run()
