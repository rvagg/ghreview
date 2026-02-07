import simpleGit from 'simple-git'

export async function getCurrentBranch () {
  const git = simpleGit()
  try {
    const status = await git.status()
    return status.current
  } catch (error) {
    throw new Error(`Failed to get current branch: ${error.message}`)
  }
}

export async function hasReviewableChanges ({ all = false } = {}) {
  const git = simpleGit()
  const status = await git.status()
  if (all) {
    return status.files.length > 0
  }
  // Exclude untracked files — user must `git add` new files explicitly
  return status.files.some(f => !(f.index === '?' && f.working_dir === '?'))
}

export async function createReviewCommit (message, authorConfig, { all = false } = {}) {
  const git = simpleGit()

  if (all) {
    await git.add('.')
  } else {
    // Only stage tracked file modifications; new files require explicit `git add`
    await git.add(['-u'])
  }

  // Set up environment for custom author if provided
  const env = {}
  if (authorConfig?.name && authorConfig?.email) {
    env.GIT_AUTHOR_NAME = authorConfig.name
    env.GIT_AUTHOR_EMAIL = authorConfig.email
    env.GIT_COMMITTER_NAME = authorConfig.name
    env.GIT_COMMITTER_EMAIL = authorConfig.email
  }

  // Create commit with optional custom author
  await git.env(env).commit(message)
}

export async function pushBranch (remote, branch) {
  const git = simpleGit()
  try {
    await git.push(remote, branch)
  } catch (error) {
    throw new Error(`Failed to push to ${remote} ${branch}: ${error.message}`)
  }
}

export async function saveIndex () {
  const git = simpleGit()
  const treeHash = await git.raw(['write-tree'])
  return treeHash.trim()
}

export async function restoreIndex (treeHash) {
  const git = simpleGit()
  await git.raw(['read-tree', treeHash])
}

export async function resetLastCommit () {
  const git = simpleGit()
  await git.reset(['HEAD~1'])
}

export async function getCurrentCommitHash () {
  const git = simpleGit()
  const log = await git.log(['-1'])
  return log.latest.hash
}

export async function ensureReviewRemote (repoUrl) {
  const git = simpleGit()
  const remotes = await git.getRemotes(true) // Get verbose info with URLs

  const reviewRemote = remotes.find(r => r.name === 'review')

  if (!reviewRemote) {
    await git.addRemote('review', repoUrl)
  } else if (reviewRemote.refs.push !== repoUrl) {
    // Update if URL changed (e.g., user switched review repos)
    await git.removeRemote('review')
    await git.addRemote('review', repoUrl)
  }

  return 'review'
}
