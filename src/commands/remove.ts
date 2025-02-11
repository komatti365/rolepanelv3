import { roleMention, SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandHandlerWithGuild } from '../types/command'
import { canUseRoleArgument } from '../util/permission'
import { selectedMessage } from './select'

export const command = new SlashCommandSubcommandBuilder()
  .setName('remove')
  .setDescription('選択されたパネルから役職を削除します')
;[...Array(20).keys()].forEach((i) => {
  command.addRoleOption((option) =>
    option
      .setName(`role${i + 1}`)
      .setDescription('パネルから削除する役職です。')
      .setRequired(i === 0)
  )
})

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  const message = await selectedMessage.getFromInteraction(client, interaction)
  const guild = await client.fetchGuild(interaction.guildId)
  const member = await client.fetchMember(guild, interaction.user.id)

  // Argument parse
  const options = interaction.options
  for (let i = 0; i < 20; i++) {
    const partialRole = options.getRole(`role${i + 1}`)
    if (!partialRole) {
      continue
    }
    const role = await client.fetchRole(guild, partialRole.id)
    // Todo: 使えない役職はスキップする
    canUseRoleArgument(member, role)
    const mention = roleMention(role.id)
    const embed = message.embeds[0]
    const description = embed.description || ''
    const pattern = new RegExp('(?:<a?:.+?:(\\d+)>|(.+)):' + mention + '\\n?')
    const match = pattern.exec(description)
    if (!match) {
      continue
    }
    let emoji: string | undefined
    for (let j = 1; j <= 2 && !emoji; j++) {
      // j = 1: Custom Emoji
      // j = 2: Unicode Emoji
      emoji = match.at(j)
    }
    embed.description = description.replace(match.at(0)!, '')
    if (!embed.description) {
      await message.delete()
    } else {
      await message.edit({ embeds: [embed] })
      if (!!emoji) {
        await message.reactions.resolve(emoji)?.remove()
      }
    }
  }
  await interaction.deleteReply()
}
