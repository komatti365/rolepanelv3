import { Embed, SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandHandlerWithGuild } from '../types/command'
import {
  Interaction,
  Message,
  MessageActionRow,
  MessageSelectMenu,
  Snowflake,
  TextChannel,
  WebhookEditMessageOptions,
} from 'discord.js'
import { isPanel, isV2Panel } from '../util/panel'
import { getABCEmoji } from '../util/emoji'
import { APIMessage } from 'discord-api-types/v9'
import * as assert from 'assert'
import { selectPanel } from './select'
import { RolePanelClient } from '../types/client'
import { v2Transfer } from './transfer'

export const command = new SlashCommandSubcommandBuilder()
  .setName('select')
  .setDescription('スマホ向けのパネル選択コマンドです。')
  .addBooleanOption((option) =>
    option
      .setName('oldest_first')
      .setDescription(
        'メッセージの検索を古い方から行います。指定しなければ最新のメッセージから検索します。'
      )
  )

const searchPanel = async (
  channel: TextChannel,
  before?: Snowflake,
  after?: Snowflake
): Promise<Array<Message>> => {
  const client = channel.client
  const result = []
  while (result.length === 0) {
    const messages = await channel.messages.fetch(
      { before, after, limit: 100 },
      { cache: true }
    )
    if (messages.size === 0) {
      return []
    }
    const panels = messages.filter((message) => {
      return isPanel(client, message) || isV2Panel(message)
    })
    for (const [, message] of panels) {
      result.push(message)
    }
    if (before) {
      before = messages.lastKey()
    } else {
      after = messages.firstKey()
    }
  }
  assert(parseInt(result[0].id) >= parseInt(result[result.length - 1].id))
  return result.slice(0, 22)
}

const createMenu = (messages: Array<Message>): WebhookEditMessageOptions => {
  const description = messages
    .map((message, index) => `${getABCEmoji(index)}: ${message.url}`)
    .join('\n')
  const embed = new Embed({
    title: 'どのパネルを選択しますか？',
    description: description,
  })
  const menu = new MessageSelectMenu()
    .setCustomId('panelSelector')
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions(
      messages.map((message, index) => ({
        label: getABCEmoji(index),
        description: isV2Panel(message) ? 'v2パネル引き継ぎ' : 'パネル選択',
        value: `${index}`,
      }))
    )
    .addOptions({
      label: 'もっと新しく',
      value: 'newer',
    })
    .addOptions({
      label: 'もっと古く',
      value: 'older',
    })
    .addOptions({
      label: 'キャンセル',
      value: 'cancel',
    })
  return {
    embeds: [embed],
    components: [new MessageActionRow().addComponents(menu)],
  }
}

type Common = {
  client: RolePanelClient
  channel: TextChannel
  author: Snowflake
}

export const replyMenu = async (
  common: Common,
  sender: (options: WebhookEditMessageOptions) => Promise<Message | APIMessage>,
  before?: Snowflake,
  after?: Snowflake
) => {
  const { channel } = common
  const panels = await searchPanel(channel, before, after)
  if (panels.length === 0) {
    await sender({
      content: 'パネルが見つかりませんでした',
    })
    return
  }
  const content = createMenu(panels)
  let message = await sender(content)
  if (message instanceof Message) {
    assert.equal(message.channel.id, channel.id)
  } else {
    assert.equal(message.channel_id, channel.id)
    message = await channel.messages.fetch(message.id)
  }

  registerHandler(common, message, panels)
}

const registerHandler = (
  common: Common,
  message: Message,
  panels: Message[]
) => {
  const { author, client } = common
  const newer = panels[0].id
  const older = panels[panels.length - 1].id
  const handler = async (interaction: Interaction) => {
    if (
      !interaction.isSelectMenu() ||
      !interaction.inCachedGuild() ||
      interaction.message.id !== message.id ||
      interaction.channelId !== message.channelId
    ) {
      return
    }
    if (interaction.user.id !== author) {
      await interaction.reply({
        content: 'コマンドの使用者以外は使えません',
        ephemeral: true,
      })
      return
    }
    client.off('interactionCreate', handler)
    const value = interaction.values[0]
    await message.delete()
    if (value === 'cancel') {
      return
    } else if (value === 'newer') {
      const m = interaction.reply({ fetchReply: true })
      await replyMenu(
        common,
        (o) =>
          interaction.reply({
            ...o,
            fetchReply: true,
            ephemeral: false,
          }),
        undefined,
        newer
      )
    } else if (value === 'older') {
      await replyMenu(
        common,
        (o) =>
          interaction.reply({
            ...o,
            fetchReply: true,
            ephemeral: false,
          }),
        older,
        undefined
      )
    } else {
      const panel = panels[parseInt(value)]
      if (isV2Panel(panel)) {
        await v2Transfer(panel, interaction.channel!)
      } else {
        await selectPanel(client, interaction, panel, async (o) =>
          interaction.reply(o)
        )
      }
    }
  }
  client.on('interactionCreate', handler)
}

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  const channel = await client.fetchTextChannel(interaction.channelId)
  const oldest_first = interaction.options.getBoolean('oldest_first') ?? false
  const after = oldest_first ? '0' : undefined
  await replyMenu(
    {
      client,
      channel,
      author: interaction.user.id,
    },
    (o) => interaction.editReply(o),
    undefined,
    after
  )
}
