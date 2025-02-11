import {
  ApplicationCommandData,
  BaseCommandInteraction,
  InteractionReplyOptions,
  Message,
  SelectMenuInteraction,
  Snowflake,
  WebhookMessageOptions,
} from 'discord.js'
import { ContextHandlerWithGuild } from '../types/command'
import { isPanel } from '../util/panel'
import { EmbedIsDeleted, NoSelectedPanel } from '../types/error'
import { RolePanelClient } from '../types/client'
import { APIMessage } from 'discord-api-types/v9'
import { PrismaClient } from '@prisma/client'

type interactionType = {
  guildId: Snowflake
  user: { id: Snowflake }
}

type MessageManagerKeyType = `${Snowflake}:${Snowflake}`
type MessageManagerValueType = [Snowflake, Snowflake]

type SelectedStore = {
  get: (
    key: MessageManagerKeyType
  ) => Promise<MessageManagerValueType | undefined>
  set: (
    key: MessageManagerKeyType,
    value: MessageManagerValueType
  ) => Promise<void>
  delete: (key: MessageManagerKeyType) => Promise<void>
}

class MessageManager {
  private data: SelectedStore
  constructor(data: SelectedStore) {
    this.data = data
  }
  private async get(client: RolePanelClient, key: MessageManagerKeyType) {
    const entity = await this.data.get(key)
    if (!entity) {
      throw new NoSelectedPanel()
    }
    const message = await client.fetchMessage(entity[0], entity[1])
    if (message.embeds.at(0) === undefined) {
      throw new EmbedIsDeleted()
    }
    return message
  }
  public getFromInteraction(
    client: RolePanelClient,
    interaction: interactionType
  ) {
    return this.get(client, `${interaction.guildId}:${interaction.user.id}`)
  }

  public async setFromInteraction(
    interaction: interactionType,
    value: Message
  ) {
    return await this.data.set(
      `${interaction.guildId}:${interaction.user.id}`,
      [value.channelId, value.id]
    )
  }

  public async deleteFromInteraction(interaction: interactionType) {
    return await this.data.delete(
      `${interaction.guildId}:${interaction.user.id}`
    )
  }
}

class PrismaSelectedStore implements SelectedStore {
  private client: PrismaClient
  constructor(client: PrismaClient) {
    this.client = client
  }

  async get(
    key: MessageManagerKeyType
  ): Promise<MessageManagerValueType | undefined> {
    const selected = await this.client.selected_message.findUnique({
      where: {
        key: key,
      },
    })
    if (!selected) {
      return undefined
    }
    return [selected.channel_id, selected.message_id]
  }

  async delete(key: MessageManagerKeyType): Promise<void> {
    await this.client.selected_message.delete({
      where: {
        key: key,
      },
    })
  }

  async set(
    key: MessageManagerKeyType,
    value: MessageManagerValueType
  ): Promise<void> {
    const data = {
      channel_id: value[0],
      message_id: value[1],
    }
    await this.client.selected_message.upsert({
      where: { key },
      create: { key, ...data },
      update: data,
    })
  }
}

export const selectedMessage = new MessageManager(
  new PrismaSelectedStore(new PrismaClient())
)
export const commandName = 'パネル選択'
export const command: ApplicationCommandData = {
  name: commandName,
  type: 3,
  defaultPermission: true,
}

export const selectPanel = async (
  client: RolePanelClient,
  interaction:
    | BaseCommandInteraction<'cached'>
    | SelectMenuInteraction<'cached'>,
  message: Message | APIMessage,
  action?: (option: InteractionReplyOptions) => Promise<any>
) => {
  if (!action) {
    action = (option: InteractionReplyOptions) => interaction.editReply(option)
  }
  if (!(message instanceof Message)) {
    const channel = await client.fetchTextChannel(message.channel_id)
    message = await channel.messages.fetch(message.id, { force: true })
  } else {
    message = await message.fetch(true)
  }
  if (!isPanel(client, message)) {
    await action({
      content: 'このメッセージはパネルではありません',
    })
    return
  }
  await selectedMessage.setFromInteraction(interaction, message)
  await action({
    content: `以下のパネルを選択しました。\n${message.url}`,
  })
}

export const handler: ContextHandlerWithGuild = async (client, interaction) => {
  let message = interaction.options.getMessage('message', true)
  await selectPanel(client, interaction, message)
}
