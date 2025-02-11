import { DiscordAPIError } from 'discord.js'

export function is403Error(e: unknown): e is DiscordAPIError {
  return e instanceof DiscordAPIError && e.httpStatus === 403
}
