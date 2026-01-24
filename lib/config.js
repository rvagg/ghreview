import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import ghauth from 'ghauth'
import { read } from 'read'

function getConfigPath () {
  const home = os.homedir()
  switch (os.platform()) {
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', 'ghreview', 'config.json')
    case 'win32':
      return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'ghreview', 'config.json')
    default:
      return path.join(process.env.XDG_CONFIG_HOME || path.join(home, '.config'), 'ghreview', 'config.json')
  }
}

const CONFIG_FILE = getConfigPath()
const CONFIG_DIR = path.dirname(CONFIG_FILE)

async function readConfig () {
  try {
    const configData = await fs.readFile(CONFIG_FILE, 'utf8')
    return JSON.parse(configData)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {}
    }
    throw error
  }
}

async function writeConfig (config) {
  await fs.mkdir(CONFIG_DIR, { recursive: true, mode: 0o700 })
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 })
}

export async function loadConfig () {
  const config = await readConfig()
  let configChanged = false

  // Check if we need to acquire a token
  if (!config.githubToken) {
    console.log('GitHub authentication required.\n')
    const authData = await ghauth({
      configName: 'ghreview',
      scopes: ['repo'],
      noSave: true,
      noDeviceFlow: true
    })
    config.githubToken = authData.token
    config.user = authData.user
    configChanged = true
  }

  // Check if we need a reviewRepo
  if (!config.reviewRepo) {
    const defaultRepo = config.user ? `${config.user}/reviews` : null
    const prompt = defaultRepo
      ? `Review repository (owner/repo) [${defaultRepo}]: `
      : 'Review repository (owner/repo): '

    const input = await read({ prompt })
    config.reviewRepo = input || defaultRepo

    if (!config.reviewRepo) {
      throw new Error('Review repository is required')
    }
    configChanged = true
  }

  // Validate repo format
  if (!config.reviewRepo.includes('/')) {
    throw new Error('Invalid reviewRepo format. Expected: owner/repo')
  }

  // Save config if anything changed
  if (configChanged) {
    await writeConfig(config)
    console.log(`\nConfig saved to ${CONFIG_FILE}\n`)
  }

  return config
}

export async function ensureConfigDir () {
  await fs.mkdir(CONFIG_DIR, { recursive: true })
}
