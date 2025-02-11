import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { EmojiIdentifierResolvable, Message } from 'discord.js'
import { BOT_TOKEN } from '../const'

const rest = new REST({ offset: 0, version: '9' }).setToken(BOT_TOKEN)

export async function fastReact(
  message: Message,
  emoji: EmojiIdentifierResolvable
) {
  return await rest.put(
    Routes.channelMessageOwnReaction(
      message.channelId,
      message.id,
      encodeURIComponent(emoji.toString().replace(/<|>/g, ''))
    )
  )
}
