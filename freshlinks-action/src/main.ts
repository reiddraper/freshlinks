import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as freshlinks from 'freshlinks'

async function run(): Promise<void> {
  try {
    const scan_glob: string = core.getInput('glob', {required: true})
    const suggestions: boolean = core.getInput('suggestions') !== 'false'
    core.debug(`Scanning glob ${scan_glob}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

    let possibleLinkDestinations: string[]
    if (suggestions) {
      possibleLinkDestinations = await freshlinks.gitLsFiles()
    } else {
      possibleLinkDestinations = []
    }

    const globber = await glob.create(scan_glob)

    let failed = false

    for await (const [
      link,
      valid
    ] of freshlinks.validate_markdown_links_from_files(
      globber.globGenerator()
    )) {
      if (valid === freshlinks.LinkValidity.Invalid) {
        failed = true
        const sourceFile = link.sourceFile.replace(
          '/home/runner/work/freshlinks/freshlinks/',
          ''
        )

        let errorMsg = `Could not find ${link.link}`

        if (suggestions) {
          const [suggestion, distance] = freshlinks.suggestPath(
            link.sourceFile,
            link.link,
            possibleLinkDestinations
          )
          // Don't suggest matches that are too far away from the original
          // link
          if (distance <= freshlinks.SUGGEST_MIN_DISTANCE) {
            errorMsg = `Could not find link. Perhaps you meant: \`${suggestion}\`?`
          }
        }
        const msg = `file=${sourceFile},line=${link.startLine},col=${link.startCol}::${errorMsg}`
        console.log(`::error ${msg}`) // eslint-disable-line no-console
      }
    }

    if (failed) {
      core.setFailed('Invalid links found')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
