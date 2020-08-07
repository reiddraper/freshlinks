import {MarkdownLink} from './parse-markdown-links'
import {join, dirname} from 'path'
import {parse} from 'url'
import {promises as fs} from 'fs'

export enum LinkValidity {
  Valid,
  Invalid,
  Unknown
}

export async function valid_link(link: MarkdownLink): Promise<LinkValidity> {
  const parsedUrl = parse(link.link)
  if (!parsedUrl.protocol && !parsedUrl.host) {
    let linkPath = parsedUrl.pathname
    if (!linkPath) {
      linkPath = ''
    }

    // NOTE TO SELF
    // The current issue is I'm concatenating the filename with the relative path.
    // I need to concatenate the *directory* with the relative path, and the relative path needs
    // to have the first `../` removed, if it exists (since we've already backed up a directory going from filename to dir)

    const sourceFile = dirname(link.sourceFile)

    // don't test absolute paths
    if (!linkPath.startsWith('/')) {
      const joinedLinkPath = join(sourceFile, linkPath)
      try {
        await fs.access(joinedLinkPath)
        return LinkValidity.Valid
      } catch (error) {
        return LinkValidity.Invalid
      }
    } else {
      return LinkValidity.Unknown
    }
  } else {
    return LinkValidity.Unknown
  }
}
