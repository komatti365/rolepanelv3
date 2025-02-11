import { CommandHandlerWithGuild } from '../types/command'
import { Embed, SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { PermissionString } from 'discord.js'

export const command = new SlashCommandSubcommandBuilder()
  .setName('debug')
  .setDescription('デバッグのための情報を出力します')

const PERM_KEYS: Array<PermissionString> = [
  'VIEW_CHANNEL',
  'SEND_MESSAGES',
  'EMBED_LINKS',
  'USE_EXTERNAL_EMOJIS',
  'MANAGE_MESSAGES',
  'READ_MESSAGE_HISTORY',
  'ADD_REACTIONS',
]
const emoji = (x: any): string => {
  if (x) {
    return ':white_check_mark:'
  } else {
    return ':x:'
  }
}

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  const guild = await client.fetchGuild(interaction.guildId)
  const me = await guild.members.fetch(client.user!.id)
  const embed = new Embed({
    title: 'デバッグ情報',
    description: `
    ギルドID: ${interaction.guildId}
    チャンネルID: ${interaction.channelId}
    ユーザーID: ${interaction.user.id}
    役職の管理があるか？: ${emoji(me.permissions.has('MANAGE_ROLES'))}
  `,
  })
  const channel = interaction.channel
  if (channel) {
    const permission = channel.permissionsFor(me, true)
    const value = PERM_KEYS.map(
      (key) => `${key}: ${emoji(permission.has(key))}`
    ).join('\n')
    embed.addField({
      name: 'チャンネル権限情報',
      value: value,
    })
  }
  await interaction.editReply({ embeds: [embed] })
}
