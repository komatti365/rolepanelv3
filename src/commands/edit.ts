import { selectedMessage } from './select'
import { CommandHandlerWithGuild } from '../types/command'
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { hasRoleManagement } from '../util/permission'
import { parseColor } from '../util/color'

export const command = new SlashCommandSubcommandBuilder()
  .setName('edit')
  .setDescription('選択したパネルのタイトルを変更します。')
  .addStringOption((option) =>
    option.setName('title').setDescription('タイトル')
  )
  .addStringOption((option) => option.setName('color').setDescription('カラー'))

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  // Argument parse
  const message = await selectedMessage.getFromInteraction(client, interaction)
  const title = interaction.options.getString('title')
  const color = interaction.options.getString('color')

  const guild = await client.fetchGuild(message.guildId!)
  const member = await client.fetchMember(guild, interaction.user.id)
  hasRoleManagement(member)
  const embed = message.embeds[0]
  if (title) {
    embed.setTitle(title)
  }
  if (color) {
    embed.setColor(parseColor(color))
  }
  await message.edit({ embeds: [embed] })
  await interaction.deleteReply()
}
