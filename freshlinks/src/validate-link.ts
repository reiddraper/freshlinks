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

    const decodedLinkPath = decodeURIComponent(linkPath)

    const sourceFile = dirname(link.sourceFile)

    // don't test absolute paths
    if (!decodedLinkPath.startsWith('/')) {
      const joinedLinkPath = join(sourceFile, decodedLinkPath)
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
