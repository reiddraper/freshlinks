import {MarkdownLink} from './parse-markdown-links'
import {LinkValidity} from './validate-link'
import chalk from 'chalk'

export function formatMarkdownLink(
  link: MarkdownLink,
  valid: LinkValidity
): string {
  return `File: ${link.sourceFile}\tLink: ${link.link}\tLocation: [[${link.startLine},${link.startCol}],[${link.endLine},${link.endCol}]]\tValid: ${LinkValidity[valid]}`
}

export function formatInvalidMarkdownLink(link: MarkdownLink): string {
  const errorString = `
  ${chalk.underline(`${link.sourceFile}:${link.startLine}`)}
  ${chalk.bold.red('Error')} Could not resolve link: ${chalk.yellow(link.link)}`
  return errorString
}
