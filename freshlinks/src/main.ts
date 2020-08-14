import {formatMarkdownLink, formatInvalidMarkdownLink} from './format'
import {
  MarkdownLink,
  parse_markdown_links_from_file,
  parse_markdown_links_from_files
} from './parse-markdown-links'
import {LinkValidity, valid_link} from './validate-link'
import {suggestPath, SUGGEST_MIN_DISTANCE} from './suggest-path'
import {gitLsFiles} from './git'

export {
  formatMarkdownLink,
  formatInvalidMarkdownLink,
  MarkdownLink,
  parse_markdown_links_from_file,
  parse_markdown_links_from_files,
  LinkValidity,
  valid_link,
  gitLsFiles,
  suggestPath,
  SUGGEST_MIN_DISTANCE
}

export async function* validate_markdown_links_from_files(
  filenames: AsyncGenerator<string>
): AsyncGenerator<[MarkdownLink, LinkValidity]> {
  for await (const links of parse_markdown_links_from_files(filenames)) {
    for (const link of links) {
      const valid = await valid_link(link)
      yield [link, valid]
    }
  }
}
