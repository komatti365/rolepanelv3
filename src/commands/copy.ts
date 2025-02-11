import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandHandlerWithGuild } from '../types/command'
import { hasRoleManagement } from '../util/permission'
import { fastReact } from '../util/react'
import { selectedMessage } from './select'

export const command = new SlashCommandSubcommandBuilder()
  .setName('copy')
  .setDescription('選択したパネルをコピーします。')

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  const guild = await client.fetchGuild(interaction.guildId)
  const member = await client.fetchMember(guild, interaction.user.id)
  hasRoleManagement(member)
  const channel = await client.fetchTextChannel(interaction.channelId)
  const message = await selectedMessage.getFromInteraction(client, interaction)
  const newMessage = await channel.send({
    embeds: message.embeds,
  })
  for (const reaction of message.reactions.cache.values()) {
    await fastReact(newMessage, reaction.emoji)
  }
  await interaction.deleteReply()
}
