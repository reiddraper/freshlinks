import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as freshlinks from 'freshlinks'
import * as mustache from 'mustache'

const defaultErrorTemplate = `
Could not find {{link}}.
{{#suggestion}}
Perhaps you meant \`{{suggested_link}}\`?
{{/suggestion}}
`.trim()

async function calculatePossibleLinkDestinations(
  suggestions: boolean
): Promise<string[]> {
  let possibleLinkDestinations: string[]
  if (suggestions) {
    possibleLinkDestinations = await freshlinks.gitLsFiles()
  } else {
    possibleLinkDestinations = []
  }
  return possibleLinkDestinations
}

async function checkFiles(
  globber: glob.Globber,
  suggestions: boolean,
  possibleLinkDestinations: string[]
): Promise<boolean> {
  let failCount = 0
  for await (const [
    link,
    valid
  ] of freshlinks.validate_markdown_links_from_files(globber.globGenerator())) {
    if (valid === freshlinks.LinkValidity.Invalid) {
      failCount++
    }
    if (valid === freshlinks.LinkValidity.Invalid) {
      reportFile(link, suggestions, possibleLinkDestinations)
    }
  }
  return failCount > 0 ? true : false
}

function reportFile(
  link: freshlinks.MarkdownLink,
  suggestions: boolean,
  possibleLinkDestinations: string[]
): void {
  const sourceFile = link.sourceFile.replace(
    '/home/runner/work/freshlinks/freshlinks/',
    ''
  )

  const suggestion = calculateSuggestion()

  type SuggestionTemplate = {suggested_link: string}
  type TemplateArgs = {link: string; suggestion?: SuggestionTemplate}
  const templateArgs: TemplateArgs = {link: link.link, suggestion: undefined}
  if (suggestion) {
    templateArgs.suggestion = {suggested_link: suggestion}
  }

  // Replace newline with %0A
  const errorMsg = mustache
    .render(defaultErrorTemplate, templateArgs)
    .replace('\n', '%0A')

  const msg = `file=${sourceFile},line=${link.startLine},col=${link.startCol}::${errorMsg}`
  console.log(`::error ${msg}`) // eslint-disable-line no-console

  function calculateSuggestion(): string | null {
    if (suggestions) {
      const [suggestedLink, distance] = freshlinks.suggestPath(
        link.sourceFile,
        link.link,
        possibleLinkDestinations
      )
      // Don't suggest matches that are too far away from the original
      // link
      if (distance <= freshlinks.SUGGEST_MIN_DISTANCE) {
        return suggestedLink
      }
    }
    return null
  }
}

async function run(): Promise<void> {
  try {
    const scan_glob: string = core.getInput('glob', {required: true})
    const suggestions: boolean = core.getInput('suggestions') !== 'false'
    core.debug(`Scanning glob ${scan_glob}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    const possibleLinkDestinations: string[] = await calculatePossibleLinkDestinations(
      suggestions
    )

    const globber = await glob.create(scan_glob)

    const failed = await checkFiles(
      globber,
      suggestions,
      possibleLinkDestinations
    )

    if (failed) {
      core.setFailed('Invalid links found')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
