import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtemp, rm, appendFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createReviewCommit } from '../lib/git.js'

const run = (dir, ...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim()

describe('createReviewCommit', () => {
  let dir

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'ghreview-git-'))
    run(dir, 'init', '-q')
    run(dir, 'config', 'user.name', 'Local User')
    run(dir, 'config', 'user.email', 'local@example.com')
    await appendFile(join(dir, 'file.txt'), 'one\n')
    run(dir, 'add', 'file.txt')
    run(dir, 'commit', '-q', '-m', 'initial')
    await appendFile(join(dir, 'file.txt'), 'two\n')
    vi.spyOn(process, 'cwd').mockReturnValue(dir)
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await rm(dir, { recursive: true, force: true })
  })

  const identity = () => run(dir, 'log', '-1', '--format=%an <%ae>|%cn <%ce>|%s')

  it('commits as the configured author and committer', async () => {
    await createReviewCommit('review', { name: 'AI Assistant', email: 'ai@example.com' })
    expect(identity()).toBe('AI Assistant <ai@example.com>|AI Assistant <ai@example.com>|review')
  })

  it('commits with the git identity when no author is configured', async () => {
    await createReviewCommit('review')
    expect(identity()).toBe('Local User <local@example.com>|Local User <local@example.com>|review')
  })
})
