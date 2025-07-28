#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { init, collect } from '../lib/index.js'
import chalk from 'chalk'

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n' + chalk.yellow('Operation cancelled by user'))
  process.exit(1)
})

process.on('SIGTERM', () => {
  process.exit(1)
})

yargs(hideBin(process.argv))
  .scriptName('ghreview')
  .usage('$0 <command> [args]')
  .command('init', 'Create a PR for review', {}, async () => {
    try {
      await init()
    } catch (error) {
      console.error(chalk.red('Error:'), error.message)
      process.exit(1)
    }
  })
  .command('collect <pr>', 'Collect feedback from PR',
    (yargs) => {
      return yargs.positional('pr', {
        describe: 'PR number or full GitHub PR URL',
        type: 'string'
      })
    },
    async (argv) => {
      try {
        await collect(argv.pr)
      } catch (error) {
        console.error(chalk.red('Error:'), error.message)
        process.exit(1)
      }
    }
  )
  .demandCommand(1, 'You need to specify a command')
  .help()
  .alias('help', 'h')
  .version()
  .alias('version', 'v')
  .parse()
