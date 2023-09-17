import { verifyKey } from 'discord-interactions'
import 'dotenv/config'
import { Request, Response } from 'express'
import { commands } from './commands/index.js'

export function VerifyDiscordRequest() {
  return function (req: Request, res: Response, buffer: Buffer) {
    const signature = req.get('X-Signature-Ed25519') ?? ''
    const timestamp = req.get('X-Signature-Timestamp') ?? ''
    const publicKey = process.env.PUBLIC_KEY ?? ''

    const isValidRequest = verifyKey(buffer, signature, timestamp, publicKey)
    if (!isValidRequest) {
      res.status(401).send('Bad request signature')
      throw new Error('Bad request signature')
    }
  }
}

export async function DiscordRequest(
  endpoint: string,
  options: Record<string, any>,
) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body)
  // Use node-fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent':
        'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options,
  })
  // throw API errors
  if (!res.ok) {
    const data = await res.json()
    console.log(res.status)
    throw new Error(JSON.stringify(data))
  }
  // return original response
  return res
}

export async function InstallGlobalCommands() {
  const commandObjects = commands.map((command) => command.commandObject)

  // API endpoint to overwrite global commands
  const endpoint = `applications/${process.env.APP_ID}/commands`

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    const res = await DiscordRequest(endpoint, {
      method: 'PUT',
      body: commandObjects,
    })
    console.log(await res.json())
  } catch (err) {
    console.error(err)
  }
}
