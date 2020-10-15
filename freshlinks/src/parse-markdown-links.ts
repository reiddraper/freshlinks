import {Parser, Node} from 'commonmark'
import {promises as fs} from 'fs'

export type MarkdownLink = {
  sourceFile: string
  link: string
  startLine: number | undefined
  startCol: number | undefined
  endLine: number | undefined
  endCol: number | undefined
}

export async function parse_markdown_links_from_file(
  filename: string
): Promise<MarkdownLink[]> {
  const fileContents = await fs.readFile(filename, 'utf-8')
  const reader = new Parser()
  const parsed = reader.parse(fileContents)

  const walker = parsed.walker()
  let event, node
  const links: MarkdownLink[] = []

  try {
    while ((event = walker.next())) {
      node = event.node
      if (event.entering && (node.type === 'link' || node.type === 'image')) {
        if (node.destination && node.parent) {
          let startLine, startCol, endLine, endCol: number | undefined
          const maybe_sourcepos = find_source_pos(node)
          if (maybe_sourcepos) {
            ;[[startLine, startCol], [endLine, endCol]] = maybe_sourcepos
          } else {
            startLine = undefined
            startCol = undefined
            endLine = undefined
            endCol = undefined
          }
          const link = {
            sourceFile: filename,
            link: node.destination,
            startLine,
            startCol,
            endLine,
            endCol
          }
          links.push(link)
        }
      }
    }
  } catch (error) {
    // TODO: log and return empty links set
  }

  return links
}

export async function* parse_markdown_links_from_files(
  filenames: AsyncGenerator<string>
): AsyncGenerator<MarkdownLink[]> {
  for await (const filename of filenames) {
    const links = await parse_markdown_links_from_file(filename)
    yield links
  }
}

// Keep walking up the node's lineage until there is a sourcepos field
function find_source_pos(
  node: Node | null
): [[number, number], [number, number]] | null {
  while (node && node.parent && !node.parent.sourcepos) {
    node = node.parent
  }
  if (node && node.parent && node.parent.sourcepos) {
    return node.parent.sourcepos
  } else {
    return null
  }
}
