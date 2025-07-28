import { describe, it, expect, vi, beforeEach } from 'vitest'
import { init, collect } from '../lib/index.js'
import * as config from '../lib/config.js'
import * as git from '../lib/git.js'
import * as github from '../lib/github.js'

vi.mock('../lib/config.js')
vi.mock('../lib/git.js')
vi.mock('../lib/github.js')

describe('ghreview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('init', () => {
    it('should create a PR when there are unstaged changes', async () => {
      // Mock config
      vi.mocked(config.loadConfig).mockResolvedValue({
        reviewRepo: 'owner/repo',
        githubToken: 'test-token',
        author: { name: 'AI', email: 'ai@example.com' }
      })

      // Mock git operations
      vi.mocked(git.hasUnstagedChanges).mockResolvedValue(true)
      vi.mocked(git.getCurrentBranch).mockResolvedValue('main')
      vi.mocked(git.ensureReviewRemote).mockResolvedValue('review')
      vi.mocked(git.createReviewCommit).mockResolvedValue()
      vi.mocked(git.pushBranch).mockResolvedValue()
      vi.mocked(git.resetLastCommit).mockResolvedValue()

      // Mock GitHub operations
      vi.mocked(github.ensureRepoExists).mockResolvedValue(true)
      vi.mocked(github.createPullRequest).mockResolvedValue({
        number: 42,
        html_url: 'https://github.com/owner/repo/pull/42'
      })

      // Run init
      await init()

      // Verify calls
      expect(git.hasUnstagedChanges).toHaveBeenCalled()
      expect(git.createReviewCommit).toHaveBeenCalled()
      expect(git.pushBranch).toHaveBeenCalledTimes(2) // base and review
      expect(git.resetLastCommit).toHaveBeenCalled()
      expect(github.createPullRequest).toHaveBeenCalled()
    })

    it('should exit early when no unstaged changes', async () => {
      vi.mocked(config.loadConfig).mockResolvedValue({
        reviewRepo: 'owner/repo',
        githubToken: 'test-token'
      })
      vi.mocked(git.hasUnstagedChanges).mockResolvedValue(false)

      await init()

      expect(git.createReviewCommit).not.toHaveBeenCalled()
      expect(github.createPullRequest).not.toHaveBeenCalled()
    })
  })

  describe('collect', () => {
    it('should collect and format feedback', async () => {
      vi.mocked(config.loadConfig).mockResolvedValue({
        reviewRepo: 'owner/repo',
        githubToken: 'test-token'
      })

      const mockComments = {
        inline: [{
          path: 'src/main.js',
          line: 10,
          body: 'Fix this'
        }],
        reviews: [{
          body: 'General comment'
        }],
        discussion: []
      }

      vi.mocked(github.fetchReviewComments).mockResolvedValue(mockComments)
      vi.mocked(github.formatFeedback).mockReturnValue('## Formatted feedback')

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      await collect(42)

      expect(github.fetchReviewComments).toHaveBeenCalledWith('owner', 'repo', 42, 'test-token')
      expect(github.formatFeedback).toHaveBeenCalledWith(mockComments)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Formatted feedback'))
    })
  })
})
