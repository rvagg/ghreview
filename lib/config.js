import fs from 'fs/promises'
import path from 'path'
import os from 'os'

const CONFIG_DIR = path.join(os.homedir(), '.ghreview')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

export async function loadConfig () {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf8')
    const config = JSON.parse(configData)

    // Validate required fields
    if (!config.reviewRepo) {
      throw new Error('Missing required config field: reviewRepo')
    }

    if (!config.githubToken) {
      throw new Error('Missing required config field: githubToken\n\nTo create a GitHub token:\n1. Go to https://github.com/settings/tokens/new\n2. Give it a name (e.g., "ghreview")\n3. Select scopes: "repo" (Full control of private repositories)\n4. Click "Generate token"\n5. Copy the token and add it to your config file')
    }

    // Validate repo format
    if (!config.reviewRepo.includes('/')) {
      throw new Error('Invalid reviewRepo format. Expected: owner/repo')
    }

    return config
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Config file not found at ${CONFIG_FILE}\nCreate it with: {"reviewRepo": "owner/repo", "githubToken": "your_github_token"}`)
    }
    throw error
  }
}

export async function ensureConfigDir () {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true })
  } catch (error) {
    // Directory might already exist, that's fine
  }
}
