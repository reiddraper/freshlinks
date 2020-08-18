import {exec, ExecOptions} from '@actions/exec'

export async function gitLsFiles(): Promise<string[]> {
  const [gitRoot] = await execCaptureOutput('git', [
    'rev-parse',
    '--show-toplevel'
  ])
  const [rawFiles] = await execCaptureOutput('git', [
    '-C',
    gitRoot.trim(),
    'ls-files'
  ])

  return rawFiles.split(/[\r\n]+/).filter(line => {
    return line !== ''
  })
}

async function execCaptureOutput(
  cmd: string,
  args: string[]
): Promise<[string, string]> {
  let out = ''
  let err = ''

  const options: ExecOptions = {}
  options.silent = true
  options.listeners = {
    stdout: (data: Buffer) => {
      out += data.toString()
    },
    stderr: (data: Buffer) => {
      err += data.toString()
    }
  }

  await exec(cmd, args, options)
  return [out, err]
}
