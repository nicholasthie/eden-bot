import 'dotenv/config'
import { InteractionType, InteractionResponseType } from 'discord-interactions'
import express, { Request, Response } from 'express'
import { VerifyDiscordRequest } from './utils.js'
import { APPLICATION_COMMANDS } from './constants/index.js'
import { commandLfg } from './commands/lfg/index.js'

const app = express()
const port = process.env.PORT

// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest() }))

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, data } = req.body

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG })
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data

    if (name === APPLICATION_COMMANDS.LFP) {
      commandLfg.handleApplicationCommands(req, res)
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    // Better way to handle message components based on application commands?
    commandLfg.handleMessageComponents(req, res)
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
