import { ColorResolvable, Util } from 'discord.js'
import { ColorParseError } from '../types/error'

export function parseColor(color: string) {
  try {
    return Util.resolveColor(color.toUpperCase() as ColorResolvable)
  } catch (e) {
    throw new ColorParseError(e)
  }
}
