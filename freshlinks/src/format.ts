import {MarkdownLink} from './parse-markdown-links'
import {LinkValidity} from './validate-link'

export function formatMarkdownLink(
  link: MarkdownLink,
  valid: LinkValidity
): string {
  return `File: ${link.sourceFile}\tLink: ${link.link}\tLocation: [[${link.startLine},${link.startCol}],[${link.endLine},${link.endCol}]]\tValid: ${LinkValidity[valid]}`
}
