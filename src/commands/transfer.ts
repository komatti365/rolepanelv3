import { APIMessage } from 'discord-api-types/v9'
import {
  ApplicationCommandData,
  Message,
  MessageEmbed,
  PartialTextBasedChannelFields,
} from 'discord.js'
import { ContextHandlerWithGuild } from '../types/command'
import { isOldv3Panel, isV2Panel, setPanel } from '../util/panel'
import { fastReact } from '../util/react'

export const commandName = 'パネル引き継ぎ'
export const command: ApplicationCommandData = {
  name: commandName,
  type: 3,
  defaultPermission: true,
}

// キャプチャについて、カスタムリアクションの場合は `emoji_name:emoji_id` 形式で、
// Unicode絵文字の場合は `絵文字名` 形式でキャプチャされる。
// このあとのmatch.findでは、キャプチャされた文字列のうち、最初のものを返す。
const pattern = /(?:<a?:(.+?:\d+)>|(.+)):<@&\d+>\n?/g

export const handler: ContextHandlerWithGuild = async (client, interaction) => {
  const message = interaction.options.getMessage('message', true)
  const channel = await client.fetchTextChannel(interaction.channelId)
  if (isV2Panel(message)) {
    await v2Transfer(message, channel)
    await interaction.deleteReply()
  } else if (isOldv3Panel(message)) {
    await v3Transfer(message, channel)
    await interaction.deleteReply()
  } else {
    await interaction.editReply({
      content: 'このメッセージはパネルではありません。',
    })
  }
}

export const v2Transfer = async (
  message: Message | APIMessage,
  channel: PartialTextBasedChannelFields
) => {
  const embed = new MessageEmbed(message.embeds.at(0)!)
  setPanel(embed)
  const newMessage = await channel.send({
    embeds: [embed],
  })
  const description = embed.description
  if (!description) {
    return
  }
  const allMatch = description.matchAll(pattern)
  for (const match of allMatch) {
    // ()によってキャプチャされた文字列(index != 0)のうち、最初のものを返す。
    // キャプチャされなかった方は空文字になるのでそこで判定
    const emoji = match.find((v, i) => i !== 0 && v)
    if (emoji) {
      await fastReact(newMessage, emoji)
    }
  }
}

export const v3Transfer = async (
  message: Message | APIMessage,
  channel: PartialTextBasedChannelFields
) => {
  const embed = new MessageEmbed(message.embeds.at(0)!)
  const newMessage = await channel.send({
    embeds: [embed],
  })
  const description = embed.description
  if (!description) {
    return
  }
  const allMatch = description.matchAll(pattern)
  for (const match of allMatch) {
    // ()によってキャプチャされた文字列(index != 0)のうち、最初のものを返す。
    // キャプチャされなかった方は空文字になるのでそこで判定
    const emoji = match.find((v, i) => i !== 0 && v)
    if (emoji) {
      await fastReact(newMessage, emoji)
    }
  }
}
