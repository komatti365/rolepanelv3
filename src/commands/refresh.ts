import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandHandlerWithGuild } from '../types/command'
import { hasRoleManagement } from '../util/permission'
import { fastReact } from '../util/react'
import { selectedMessage } from './select'

export const command = new SlashCommandSubcommandBuilder()
  .setName('refresh')
  .setDescription('選択したパネルのリアクションをつけ直します。')

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  const guild = await client.fetchGuild(interaction.guildId)
  const member = await client.fetchMember(guild, interaction.user.id)
  hasRoleManagement(member)
  const message = await selectedMessage.getFromInteraction(client, interaction)
  await message.reactions.removeAll()
  const embed = message.embeds[0]
  const lines = embed.description?.split('\n')
  if (!lines) {
    await interaction.deleteReply()
    return
  }
  for (const line of lines) {
    const emoji = line.replace(/:<@&\d+>/, '')
    await fastReact(message, emoji)
  }
  await interaction.deleteReply()
}
