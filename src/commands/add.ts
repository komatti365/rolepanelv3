import * as discord from 'discord.js'
import { Formatters, Snowflake } from 'discord.js'
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandHandlerWithGuild } from '../types/command'
import { canUseRoleArgument } from '../util/permission'
import { selectedMessage } from './select'

export const command = new SlashCommandSubcommandBuilder()
  .setName('add')
  .setDescription('パネルに役職を追加します')
;[...Array(10).keys()].forEach((i) => {
  command
    .addRoleOption((option) =>
      option
        .setName(`role${i + 1}`)
        .setDescription('パネルに追加する役職です。')
        .setRequired(i === 0)
    )
    .addStringOption((option) =>
      option
        .setName(`emoji${i + 1}`)
        .setDescription('追加する役職に使用する絵文字です。')
    )
})

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  const message = await selectedMessage.getFromInteraction(client, interaction)
  const guild = await client.fetchGuild(interaction.guildId)
  const member = await client.fetchMember(guild, interaction.user.id)
  // Option Parsing
  const options = interaction.options
  for (let i = 0; i < 10; i++) {
    const partialRole = options.getRole(`role${i + 1}`)
    const emoji = options.getString(`emoji${i + 1}`)
    if (!partialRole) {
      continue
    }
    const role = await client.fetchRole(guild, partialRole.id)
    // Todo: 使えない役職はスキップする
    canUseRoleArgument(member, role)
    if (!(await addToRoleMessage(message, role.id, emoji))) {
      break
    }
  }
  await interaction.deleteReply()
}

async function addToRoleMessage(
  message: discord.Message,
  roleId: Snowflake,
  emoji: null | string
): Promise<boolean> {
  if (message.reactions.cache.size >= 20) {
    return false
  }
  const embed = message.embeds[0]
  const description = embed.description || ''
  const lines = description.split('\n')
  let character, i
  if (emoji !== null) {
    character = emoji
    i = lines.length
  } else {
    for (i = 0; i < 20; i++) {
      character = String.fromCodePoint(0x1f1e6 + i)
      if (!description.includes(character)) {
        break
      }
    }
    // ここでundefinedを弾かないと次のif文でエラーが出る
    if (i === 20 || character === undefined) {
      return false
    }
  }
  if (!description.includes(character)) {
    // 最初にリアクションを確認(つけられないならここでエラーになるので全止め可能)
    await message.react(character)
    const newLines = lines
      .slice(0, i)
      .concat(`${character}:${Formatters.roleMention(roleId)}`)
      .concat(lines.slice(i, lines.length + 1))
      .join('\n')
    embed.setDescription(newLines)
    await message.edit({ embeds: [embed] })
    return true
  }
  return false
}
