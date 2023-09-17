import {
  ButtonStyleTypes,
  InteractionResponseType,
  MessageComponentTypes,
} from 'discord-interactions'
import { Request, Response } from 'express'
import { uniq } from 'lodash'
import { APPLICATION_COMMANDS } from '../../constants/index.js'
import { Command } from '../Command.js'
import { Party } from './types.js'

export class CommandLfg extends Command {
  name = APPLICATION_COMMANDS.LFP
  description = 'Create a new party'
  type = 1

  private parties: Map<string, Party> = new Map()

  constructor() {
    super()
  }

  /** START - Application Commands Handlers */
  handleApplicationCommands(req: Request, res: Response) {
    this.appCreateParty(req, res)
  }

  private appCreateParty(req: Request, res: Response) {
    const partyId = req.body.id
    const requesterId = req.body.member.user.id

    this.createNewParty(partyId, requesterId)

    res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: this.getPartyData(partyId),
    })
  }
  /** END - Application Commands */

  /** START - Message Components Handlers */
  handleMessageComponents(req: Request, res: Response) {
    const customId = req.body.data.custom_id as string

    if (customId.startsWith(CustomIds.JOIN)) {
      this.messageJoinParty(req, res)
    } else if (customId.startsWith(CustomIds.LEAVE)) {
      this.messageLeaveParty(req, res)
    }
  }

  private messageJoinParty(req: Request, res: Response) {
    try {
      const customId = req.body.data.custom_id as string
      const requesterId = req.body.member.user.id
      const partyId = this.getPartyIdFromCustomId(customId)
      this.joinParty(partyId, requesterId)

      res.send({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: this.getPartyData(partyId),
      })
    } catch (e) {
      res.send({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: this.getErrorData(e),
      })
    }
  }

  private messageLeaveParty(req: Request, res: Response) {
    try {
      const customId = req.body.data.custom_id as string
      const requesterId = req.body.member.user.id
      const partyId = this.getPartyIdFromCustomId(customId)
      this.leaveParty(partyId, requesterId)

      res.send({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: this.getPartyData(partyId),
      })
    } catch (e) {
      res.send({
        type: InteractionResponseType.UPDATE_MESSAGE,
        data: this.getErrorData(e),
      })
    }
  }
  /** END - Message Components Handlers */

  /** START - Party manipulation logic */
  private createNewParty(partyId: string, creator: string) {
    this.parties.set(partyId, {
      id: partyId,
      creator,
      members: [creator],
      createdTimestamp: Date.now(),
    })
  }

  private joinParty(partyId: string, member: string) {
    const party = this.getParty(partyId)

    this.parties.set(partyId, {
      ...party,
      members: uniq([...party.members, member]),
    })
  }

  private leaveParty(partyId: string, member: string) {
    const party = this.getParty(partyId)

    this.parties.set(partyId, {
      ...party,
      members: party.members.filter((_member) => _member !== member),
    })
  }
  /** END - Party manipulation logic */

  /** START - Party utilities */
  private getPartyData(partyId: string) {
    const { members } = this.getParty(partyId)

    return {
      content: `New party created!\nParty members: ${members
        .map((id) => `<@${id}>`)
        .join(' ')}`,
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              label: 'Join',
              style: ButtonStyleTypes.PRIMARY,
              custom_id: `${CustomIds.JOIN}-${partyId}`,
            },
            {
              type: MessageComponentTypes.BUTTON,
              label: 'Leave',
              style: ButtonStyleTypes.DANGER,
              custom_id: `${CustomIds.LEAVE}-${partyId}`,
            },
          ],
        },
      ],
    }
  }

  private getPartyIdFromCustomId(customId: string): string {
    return customId.split('-')[1]
  }

  private getParty(partyId: string): Party {
    const party = this.parties.get(partyId)

    if (party == undefined) {
      throw new Error('Party not found!')
    }

    return party
  }
  /** END - Party utilities */

  private getErrorData(e: any) {
    return {
      content: e?.message ?? 'Unexpected error occured',
      components: [],
    }
  }
}

enum CustomIds {
  PARTY_LIST = 'party_list',
  JOIN = 'join',
  LEAVE = 'leave',
}

export const commandLfg = new CommandLfg()
