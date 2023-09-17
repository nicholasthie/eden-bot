export abstract class Command {
  abstract name: string
  abstract description: string
  abstract type: number

  get commandObject() {
    return {
      name: this.name,
      description: this.description,
      type: this.type,
    }
  }
}
