import { APIApplicationCommandOption } from 'discord-api-types/v10'

export abstract class Command {
  abstract name: string
  abstract description: string
  abstract type: number
  abstract options: APIApplicationCommandOption[]

  get commandObject() {
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      options: this.options,
    }
  }
}
