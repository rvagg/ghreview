import { Octokit } from '@octokit/rest'
import chalk from 'chalk'

export function createOctokit (token) {
  if (!token) {
    throw new Error('GitHub token is required in config file.\n\nTo create a token:\n1. Go to https://github.com/settings/tokens/new\n2. Give it a name (e.g., "ghreview")\n3. Select scopes: "repo" (Full control of private repositories)\n4. Click "Generate token"\n5. Copy the token and add it to ~/.ghreview/config.json')
  }

  return new Octokit({
    auth: token
  })
}

export async function ensureRepoExists (owner, repo, token) {
  const octokit = createOctokit(token)

  try {
    await octokit.rest.repos.get({ owner, repo })
    return true
  } catch (error) {
    if (error.status === 404) {
      console.log(chalk.yellow(`Creating review repository: ${owner}/${repo}`))
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repo,
        private: true,
        description: 'AI code review workspace',
        auto_init: true
      })
      return true
    }
    throw error
  }
}

export async function createPullRequest (owner, repo, head, base, title, token) {
  const octokit = createOctokit(token)

  const { data: pr } = await octokit.rest.pulls.create({
    owner,
    repo,
    title,
    head,
    base,
    body: `Review checkpoint for AI-assisted development

This PR contains uncommitted changes for review.

## How to Review

1. **Inline Comments**: Click on specific lines and add comments. Use the "Add a suggestion" feature to propose specific code changes.
2. **Line Ranges**: You can select multiple lines by clicking and dragging to comment on blocks of code.
3. **General Comments**: Use the main PR comment box at the bottom for architectural or high-level feedback.

All comments will be collected with line numbers and context for AI consumption.`
  })

  return pr
}

export async function fetchReviewComments (owner, repo, prNumber, token) {
  const octokit = createOctokit(token)

  // Use GraphQL to fetch review threads with resolution status
  const query = `
    query($owner: String!, $repo: String!, $prNumber: Int!, $cursor: String) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $prNumber) {
          reviewThreads(first: 100, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              isResolved
              isOutdated
              path
              line
              startLine
              comments(first: 100) {
                nodes {
                  id
                  body
                  path
                  line: originalLine
                  startLine: originalStartLine
                  position: originalPosition
                  user: author {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  // Fetch all review threads with pagination
  const allThreads = []
  let cursor = null
  let hasNextPage = true

  while (hasNextPage) {
    const result = await octokit.graphql(query, {
      owner,
      repo,
      prNumber,
      cursor
    })

    const threads = result.repository.pullRequest.reviewThreads
    allThreads.push(...threads.nodes)
    hasNextPage = threads.pageInfo.hasNextPage
    cursor = threads.pageInfo.endCursor
  }

  // Filter to only unresolved threads and flatten comments
  const unresolvedComments = allThreads
    .filter(thread => !thread.isResolved)
    .flatMap(thread => thread.comments.nodes.map(comment => ({
      ...comment,
      path: thread.path,
      line: comment.line || thread.line,
      start_line: comment.startLine || thread.startLine,
      original_line: comment.line || thread.line,
      original_start_line: comment.startLine || thread.startLine,
      position: comment.position
    })))

  // Fetch PR reviews (general comments)
  const { data: reviews } = await octokit.rest.pulls.listReviews({
    owner,
    repo,
    pull_number: prNumber
  })

  // Fetch issue comments (PR discussion)
  const { data: issueComments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: prNumber
  })

  return {
    inline: unresolvedComments,
    reviews: reviews.filter(r => r.body), // Only reviews with comments
    discussion: issueComments
  }
}

export function formatFeedback (comments, filterBots = true) {
  let output = '## Code Review Feedback\n\n'

  // Filter out bot comments if requested
  const isBot = (comment) => {
    const login = comment.user?.login || comment.author?.login
    return filterBots && (
      comment.user?.type === 'Bot' ||
      login?.includes('[bot]') ||
      login?.includes('-bot')
    )
  }

  // Group inline comments by file and line range
  const byFile = {}
  // First, collect all comments without grouping
  const allComments = comments.inline
    .filter(comment => !isBot(comment))
    .map(comment => ({
      file: comment.path,
      line: comment.line || comment.original_line,
      startLine: comment.start_line || comment.original_start_line,
      position: comment.position,
      body: comment.body,
      id: comment.id
    }))

  // Group by file
  allComments.forEach(comment => {
    if (!byFile[comment.file]) {
      byFile[comment.file] = []
    }
    byFile[comment.file].push(comment)
  })

  // Format inline comments with better structure
  if (Object.keys(byFile).length > 0) {
    Object.entries(byFile).forEach(([file, fileComments]) => {
      output += `### File: ${file}\n\n`

      // Sort by position (or line number as fallback)
      const sortedComments = fileComments.sort((a, b) => {
        // Try position first, then line number
        if (a.position && b.position) return a.position - b.position
        return a.line - b.line
      })

      // Don't group comments - treat each as individual
      sortedComments.forEach(comment => {
        const lineRange = comment.startLine && comment.startLine !== comment.line
          ? `Lines ${comment.startLine}-${comment.line}`
          : `Line ${comment.line}`

        output += `#### ${lineRange}\n`
        output += `${comment.body}\n\n`
      })
    })
  }

  // Format general review comments (filter bots)
  const generalComments = [
    ...comments.reviews.filter(r => !isBot(r)).map(r => r.body),
    ...comments.discussion.filter(c => !isBot(c)).map(c => c.body)
  ].filter(Boolean)

  if (generalComments.length > 0) {
    output += '### General Comments\n\n'
    generalComments.forEach((comment, index) => {
      output += `---\n\n${comment}\n\n`
    })
  }

  return output
}
