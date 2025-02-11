import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandHandlerWithGuild } from '../types/command'
import { selectedMessage } from './select'
import { hasRoleManagement } from '../util/permission'

export const command = new SlashCommandSubcommandBuilder()
  .setName('autoremove')
  .setDescription('選択したパネル内にある`@deleted-role`を削除します')

const pattern = /<@&(\d*)>/

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  const message = await selectedMessage.getFromInteraction(client, interaction)
  const guild = await client.fetchGuild(interaction.guildId)
  const member = await client.fetchMember(guild, interaction.user.id)
  hasRoleManagement(member)
  const embed = message.embeds[0]
  const description = embed.description
  if (!description) {
    return
  }
  const lines = description.split('\n')
  let index = 0
  for (const line of lines.slice()) {
    const match = pattern.exec(line)
    if (!match) {
      continue
    }
    const role = await guild.roles.fetch(match[1])
    // 役職が無いならその行は消す！
    if (!role) {
      lines.splice(index, 1)
    } else {
      index += 1
    }
  }
  if (lines.length > 0) {
    embed.setDescription(lines.join('\n'))
    await message.edit({ embeds: [embed] })
  } else {
    await message.delete()
  }
  await interaction.deleteReply()
}
