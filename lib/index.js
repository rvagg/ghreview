import chalk from 'chalk'
import ora from 'ora'
import { loadConfig } from './config.js'
import {
  getCurrentBranch,
  hasUnstagedChanges,
  createReviewCommit,
  pushBranch,
  resetLastCommit,
  ensureReviewRemote
} from './git.js'
import {
  ensureRepoExists,
  createPullRequest,
  fetchReviewComments,
  formatFeedback
} from './github.js'

export async function init () {
  const spinner = ora('Initializing review').start()
  let commitCreated = false

  try {
    // Check if we're in a git repository
    try {
      await getCurrentBranch()
    } catch (error) {
      spinner.fail('Not in a git repository')
      console.error(chalk.red('Please run this command from within a git repository'))
      console.error(chalk.yellow('\nTo initialize a new repository with minimal setup:'))
      console.error(chalk.gray('  git init'))
      console.error(chalk.gray('  echo "# Project" > README.md'))
      console.error(chalk.gray('  git add README.md'))
      console.error(chalk.gray('  git commit -m "Initial commit"'))
      return
    }

    // Load config
    const config = await loadConfig()
    const [owner, repo] = config.reviewRepo.split('/')

    // Check for unstaged changes
    if (!await hasUnstagedChanges()) {
      spinner.fail('No unstaged changes to review')
      return
    }

    // Ensure review repo exists
    spinner.text = 'Checking review repository'
    await ensureRepoExists(owner, repo, config.githubToken)

    // Set up review remote (using SSH for authentication)
    const repoUrl = `git@github.com:${config.reviewRepo}.git`
    await ensureReviewRemote(repoUrl)

    // Generate timestamp for branch names
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const baseBranch = `base/${timestamp}`
    const reviewBranch = `review/${timestamp}`

    // Push current HEAD as base branch
    spinner.text = 'Pushing base branch'
    const currentBranch = await getCurrentBranch()
    await pushBranch('review', `${currentBranch}:${baseBranch}`)

    // Create temporary commit with changes
    spinner.text = 'Creating review commit'
    await createReviewCommit(
      `Review checkpoint ${timestamp}`,
      config.author
    )
    commitCreated = true

    // Push review branch
    spinner.text = 'Pushing review branch'
    await pushBranch('review', `HEAD:${reviewBranch}`)

    // Create PR
    spinner.text = 'Creating pull request'
    const pr = await createPullRequest(
      owner,
      repo,
      reviewBranch,
      baseBranch,
      `AI Code Review - ${timestamp}`,
      config.githubToken
    )

    spinner.succeed('Review created successfully')
    console.log(chalk.green('✓'), 'Created PR #' + pr.number)
    console.log(chalk.blue('🔗'), pr.html_url)
  } catch (error) {
    spinner.fail('Failed to create review')
    throw error
  } finally {
    // Always reset the commit if we created one
    if (commitCreated) {
      try {
        await resetLastCommit()
      } catch (resetError) {
        console.error(chalk.yellow('Warning: Failed to reset temporary commit'))
      }
    }
  }
}

export async function collect (prInput) {
  const spinner = ora('Collecting feedback').start()

  try {
    // Load config
    const config = await loadConfig()

    let owner, repo, prNumber

    // Check if input is a URL or just a number
    if (prInput.toString().includes('github.com')) {
      // Parse GitHub PR URL
      const urlMatch = prInput.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/)
      if (!urlMatch) {
        throw new Error('Invalid GitHub PR URL format')
      }
      [, owner, repo, prNumber] = urlMatch
      prNumber = parseInt(prNumber, 10)
    } else {
      // Use default review repo
      [owner, repo] = config.reviewRepo.split('/')
      prNumber = parseInt(prInput, 10)

      // Validate the PR number
      if (isNaN(prNumber) || prNumber <= 0) {
        throw new Error(`Invalid PR number: ${prInput}`)
      }
    }

    // Fetch all comments
    spinner.text = `Fetching review comments from ${owner}/${repo}#${prNumber}`
    const comments = await fetchReviewComments(owner, repo, prNumber, config.githubToken)

    // Format feedback
    const feedback = formatFeedback(comments)

    spinner.succeed('Feedback collected')
    console.log('\n' + feedback)
  } catch (error) {
    spinner.fail('Failed to collect feedback')
    throw error
  }
}
