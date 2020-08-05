#!/usr/bin/env node

import {parse_markdown_links} from './parse-markdown-links'

async function run(): Promise<void> {
  try {
    const links = await parse_markdown_links('/Users/reid/Desktop/foo.md')
    console.log(links)
  } catch (error) {}
}

run()
