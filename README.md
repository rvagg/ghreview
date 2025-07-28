# ghreview

[![NPM](https://nodei.co/npm/ghreview.svg?style=flat&data=n,v)](https://nodei.co/npm/ghreview/)

GitHub PR-based code review workflow for AI-assisted development.

## Overview

`ghreview` bridges the gap between AI-assisted coding and GitHub's superior code review interface. It allows you to review AI-generated code changes using GitHub's familiar PR review tools while keeping your local repository pristine.

### Why?

- **Clean local state**: Your working directory remains exactly as it was - no commits, no branch switches, no git operations visible in your project
- **Familiar workflow**: Use GitHub's excellent PR review interface with inline comments, suggestions, and discussions
- **Private reviews**: Use a dedicated private repository for reviews, keeping your AI interactions separate from your main project
- **Zero footprint**: Creates temporary branches and commits in a separate review repository, immediately cleaning up after pushing
- **AI-friendly output**: Collects all feedback in a structured format that's easy to paste back to your AI assistant

### How?

1. You work with your AI assistant and have uncommitted changes in your project
2. `ghreview init` pushes your current state to a dedicated review repository without affecting your local git state
3. You review the changes on GitHub using all the familiar tools
4. `ghreview collect` gathers your feedback in a format optimized for AI consumption
5. Your local repository remains untouched throughout - as if git was never involved

## Quick Start

### Without Installation (Recommended)

```bash
# Create review PR
npx ghreview init

# Collect feedback after reviewing on GitHub
npx ghreview collect <PR-number>
```

### With Global Installation

```bash
# Install globally
npm install -g ghreview

# Use commands
ghreview init
ghreview collect <PR-number>
```

## Setup

### 1. Create a GitHub Personal Access Token

1. Go to https://github.com/settings/tokens/new (or navigate to Settings → Developer settings → Personal access tokens → Tokens (classic))
2. Give your token a descriptive name (e.g., "ghreview")
3. Set an expiration (or select "No expiration" for permanent access)
4. Select the **`repo`** scope - this grants full control of private repositories
   - ✓ repo (Full control of private repositories)
     - ✓ repo:status
     - ✓ repo_deployment
     - ✓ public_repo
     - ✓ repo:invite
     - ✓ security_events
5. Click "Generate token"
6. **Important**: Copy the token immediately - you won't be able to see it again!

### 2. Configure ghreview

Create a configuration file at `~/.ghreview/config.json`:

```json
{
  "reviewRepo": "yourusername/ai-code-reviews",
  "githubToken": "ghp_xxxxxxxxxxxxxxxxxxxx"
}
```

Replace `yourusername` with your GitHub username and paste your token in place of `ghp_xxxxxxxxxxxxxxxxxxxx`.

**Security Note**: Keep your token secure! The config file contains sensitive credentials. You may want to:
- Set appropriate file permissions: `chmod 600 ~/.ghreview/config.json`
- Never commit this file to version control
- Consider using a token with an expiration date

The review repository will be created automatically as a private repo if it doesn't exist.

## Configuration Options

### Basic Configuration

```json
{
  "reviewRepo": "yourusername/ai-code-reviews",
  "githubToken": "ghp_xxxxxxxxxxxxxxxxxxxx"
}
```

### With Custom Author

```json
{
  "reviewRepo": "yourusername/ai-code-reviews",
  "githubToken": "ghp_xxxxxxxxxxxxxxxxxxxx",
  "author": {
    "name": "AI Assistant",
    "email": "ai@example.com"
  }
}
```

The `author` configuration makes commits appear as if they were created by the AI, making it clearer that you're reviewing the AI's proposed changes.

## Workflow

1. **Make changes to your code** (but don't commit them)

2. **Create a review PR**:
   ```bash
   npx ghreview init
   ```
   This will:
   - Push your current commit as a base branch
   - Push your uncommitted changes as a review branch
   - Create a PR comparing the two
   - Output a URL to review the changes

3. **Review on GitHub**:
   - Click the provided URL
   - Review the changes using GitHub's PR interface
   - Leave inline comments on specific lines
   - Add general comments about architecture or approach

4. **Collect feedback**:
   ```bash
   # Using PR number (defaults to review repo)
   npx ghreview collect 42

   # Using full PR URL (works with any GitHub repo)
   npx ghreview collect https://github.com/owner/repo/pull/123
   ```
   This outputs formatted feedback that you can copy and paste into your AI assistant.

5. **Iterate**: Your local changes remain uncommitted, so you can continue working and create new review PRs as needed.

## Example Output

```markdown
## Code Review Feedback

### File: src/auth/login.js

#### Line 45
Variable 'username' could be undefined here. Add null check.

#### Lines 67-70
Use consistent async/await instead of mixing with .then()

### File: src/utils/validation.js

#### Line 12
Regex for email validation is too permissive

#### Lines 23-28
**Comment 1:** This validation logic is duplicated in register.js
**Comment 2:** Consider extracting to a shared validation utility

### General Comments

---

Consider adding rate limiting to login attempts

---

The session token storage in localStorage is insecure
```

## Development

```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run tests
npm test
```

## Requirements

- Node.js >= 22
- Git
- GitHub personal access token (configured in `~/.ghreview/config.json`)
- SSH access to GitHub (the tool uses `git@github.com:` URLs for pushing)

## License

Apache-2.0
