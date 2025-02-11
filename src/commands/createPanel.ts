import { roleMention, SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { CommandHandlerWithGuild } from '../types/command'
import { canUseRoleArgument } from '../util/permission'
import { MessageEmbed } from 'discord.js'
import { setPanel } from '../util/panel'
import { getABCEmoji } from '../util/emoji'
import { selectedMessage } from './select'
import { parseColor } from '../util/color'

export const command = new SlashCommandSubcommandBuilder()
  .setName('create')
  .setDescription('パネルを新しく作成します')
  .addRoleOption((option) =>
    option
      .setName('role')
      .setDescription('パネルに最初に追加する役職です。')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('title')
      .setDescription(
        'パネルのタイトルです。指定しなければ「役職パネル」になります。'
      )
  )
  .addStringOption((option) =>
    option
      .setName('color')
      .setDescription('パネルのカラーです。指定しなければ黒になります。')
  )
  .addStringOption((option) =>
    option
      .setName('emoji')
      .setDescription(
        '最初に追加する役職の絵文字です。指定しなければABC絵文字が使用されます。'
      )
  )

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  // Todo: Emoji引数
  const options = interaction.options
  const guild = await client.fetchGuild(interaction.guildId)
  const member = await client.fetchMember(guild, interaction.user.id)
  const role = await client.fetchRole(guild, options.getRole('role', true).id)
  const channel = await client.fetchTextChannel(interaction.channelId)
  const emoji = options.getString('emoji') ?? getABCEmoji(0)
  canUseRoleArgument(member, role)
  const title = options.getString('title') ?? '役職パネル'
  const color = parseColor(options.getString('color') ?? 'DEFAULT')
  const embed = new MessageEmbed({
    title: title,
    description: `${emoji}:${roleMention(role.id)}`,
    color: color,
  })
  setPanel(embed)
  const message = await channel.send({ embeds: [embed] })
  try {
    await message.react(emoji)
  } catch (error) {
    await message.delete()
    throw error
  }
  await selectedMessage.setFromInteraction(interaction, message)
  await interaction.deleteReply()
}
