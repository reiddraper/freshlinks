import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as freshlinks from 'freshlinks'

async function run(): Promise<void> {
  try {
    const scan_glob: string = core.getInput('glob')
    core.debug(`Scanning glob ${scan_glob}`) // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true

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
        const msg = `file=${link.sourceFile},line=${link.startLine},col:${link.startCol}::Could not find ${link.link}`
        core.error(msg)
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
