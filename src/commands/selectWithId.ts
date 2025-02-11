import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandHandlerWithGuild } from '../types/command'
import { selectPanel } from './select'

export const command = new SlashCommandSubcommandBuilder()
  .setName('selectwithid')
  .setDescription('メッセージIDによってパネルを選択します（スマホ版向けコマンドです）')
  .addNumberOption((option) =>
    option
      .setName('メッセージID')
      .setDescription('パネルのメッセージIDです')
      .setRequired(true)
  );

export const handler: CommandHandlerWithGuild = async (client, interaction) =>{
  const channel = await client.fetchTextChannel(interaction.channelId)
  const messageId = interaction.options.getNumber('メッセージID', true)
  const message = await channel.messages.fetch(messageId.toString())
  await selectPanel(client, interaction, message)
}