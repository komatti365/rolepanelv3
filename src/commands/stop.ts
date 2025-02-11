import { CommandHandler } from '../types/command'
import { ApplicationCommandPermissionData, Client } from 'discord.js'
export const StopCommandName = 'rpstop'

export const StopCommandHandler: CommandHandler = async (
  client,
  interaction
) => {
  if (interaction.user.id === client.application?.owner?.id) {
    await interaction.deleteReply()
    await client.destroy()
    return
  }
  await interaction.editReply({ content: 'あなたにこのコマンドは使えません' })
}

export const initStopCommand = async (client: Client) => {
  if (!client.application?.owner) {
    await client.application?.fetch()
  }
  const ownerId = client.application!.owner!.id
  const commandData = {
    name: StopCommandName,
    description: 'BOT停止',
    defaultPermission: false,
  }
  const permissions: Array<ApplicationCommandPermissionData> = [
    {
      id: ownerId,
      type: 'USER',
      permission: true,
    },
  ]
  for (const [_, guild] of client.guilds.cache) {
    try {
      await guild.members.fetch(ownerId)
    } catch (e) {
      continue
    }
    const command = await guild.commands.create(commandData)
    await command!.permissions.add({ permissions: permissions })
  }
}
