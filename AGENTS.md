# ghreview

GitHub PR-based code review workflow for AI agents.

## IMPORTANT INSTRUCTIONS FOR AI AGENTS
- NEVER perform destructive/write git commands unless explicitly asked (commit, reset, etc.)
- The user manages their git commits - do not commit for them
- ALWAYS run `npm run lint:fix` and `npm test` before considering changes complete

## Commands
- `ghreview init` - Push HEAD + unstaged changes as PR
- `ghreview collect <PR>` - Output formatted review feedback (PR can be number or full URL)

## Key Files
- lib/index.js - Core logic (init, collect)
- lib/github.js - GitHub API (Octokit)
- lib/git.js - Git operations (simple-git)
- lib/config.js - Config management

## Architecture
- Uses review remote to avoid polluting project
- Creates base/timestamp and review/timestamp branches
- Resets local changes after push
- Formats PR comments for AI consumption

## Testing
`npm test` - Run vitest tests

## Config
~/.ghreview/config.json:
```json
{
  "reviewRepo": "owner/repo",
  "githubToken": "github_pat_...",
  "author": {"name": "AI", "email": "ai@example.com"}
}
```

## Environment
- Node.js >= 22 (ES modules)