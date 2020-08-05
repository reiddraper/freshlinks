import {Parser} from 'commonmark'
import {promises as fs} from 'fs'

type MarkdownLink = {
  sourceFile: string
  link: string
  startLine: number
  startCol: number
  endLine: number
  endCol: number
}

export async function parse_markdown_links(
  filename: string
): Promise<Array<MarkdownLink>> {
  const fileContents = await fs.readFile(filename, 'utf-8')
  const reader = new Parser()
  const parsed = reader.parse(fileContents)

  var walker = parsed.walker()
  let event, node
  let links: Array<MarkdownLink> = []

  while ((event = walker.next())) {
    node = event.node
    if (event.entering && node.type === 'link') {
      if (node.destination && node.parent) {
        const [[startLine, startCol], [endLine, endCol]] = node.parent.sourcepos
        const link = {
          sourceFile: filename,
          link: node.destination,
          startLine: startLine,
          startCol: startLine,
          endLine: endLine,
          endCol: endCol
        }
        links.push(link)
      }
    }
  }

  return links
}
