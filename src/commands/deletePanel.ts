import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandHandlerWithGuild } from '../types/command'
import { selectedMessage } from './select'

export const command = new SlashCommandSubcommandBuilder()
  .setName('delete')
  .setDescription('選択したパネルを削除します')

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  const message = await selectedMessage.getFromInteraction(client, interaction)
  await message.delete()
  await interaction.deleteReply()
  await selectedMessage.deleteFromInteraction(interaction)
}
