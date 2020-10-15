import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

// shows how the runner will run a javascript action with env / stdout protocol
test('Returns an error with broken links', () => {
  process.env['INPUT_GLOB'] = 'data/test/fails/**.md'
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  expect(() => {
    cp.execSync(`node ${ip}`, options).toString()
  }).toThrow()
})

test('Runs succesfully with no broken links', () => {
  process.env['INPUT_GLOB'] = 'data/test/succeeds/**.md'
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  expect(cp.execSync(`node ${ip}`, options).toString())
})
