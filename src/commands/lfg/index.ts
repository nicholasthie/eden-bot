import { APPLICATION_COMMANDS } from '../../constants/index.js'
import { Command } from '../Command.js'

export class CommandLfg extends Command {
  name = APPLICATION_COMMANDS.LFG
  description = 'Create a new party'
  type = 1

  constructor() {
    super()
  }
}

export const commandLfg = new CommandLfg()
