import { BaseCommandInteraction, ClientEvents, DMChannel } from 'discord.js'
import {
  allContextMenus,
  allSubCommands,
  CommandPrefix,
} from '../commands/init'
import { RolePanelClient } from '../types/client'
import { HandlerWithGuild } from '../types/command'
import { onCommandError } from './commandError'
import { NoPrivateMessage } from '../types/error'
import { StopCommandHandler, StopCommandName } from '../commands/stop'

async function handleCommand<T extends BaseCommandInteraction>(
  client: RolePanelClient,
  interaction: T,
  handler: HandlerWithGuild<T> | undefined
) {
  if (!handler) {
    return
  }
  await interaction.deferReply()
  if (interaction.inCachedGuild()) {
    try {
      await handler(client, interaction)
    } catch (e) {
      await onCommandError(client, interaction, e)
    }
  } else {
    await onCommandError(client, interaction, new NoPrivateMessage())
  }
}

function logCommand(
  client: RolePanelClient,
  interaction: BaseCommandInteraction,
  commandName: string
) {
  const guild = interaction.guild
  const channel = interaction.channel
  const channelName = (() => {
    if (!channel || channel instanceof DMChannel || channel?.partial) {
      return 'DM'
    } else {
      return channel.name
    }
  })()
  client.log(
    `[COMMAND-USED]` +
      `guild:\`${guild?.name} (ID:${guild?.id})\`` +
      `ch:\`${channelName}(ID:${interaction.channel?.id})\`` +
      `cmdname:\`${commandName}\``
  )
}

export async function onInteractionCreate(
  client: RolePanelClient,
  [interaction]: ClientEvents['interactionCreate']
) {
  if (interaction.isCommand()) {
    let handler
    const commandName = interaction.commandName
    if (commandName === CommandPrefix) {
      const target = interaction.options.getSubcommand(true)
      const command = allSubCommands.find(
        ({ command }) => command.name === target
      )
      handler = command?.handler
      logCommand(client, interaction, target)
    } else if (commandName === StopCommandName) {
      handler = StopCommandHandler
      logCommand(client, interaction, 'stop')
    }
    await handleCommand(client, interaction, handler)
  } else if (interaction.isContextMenu()) {
    const command = allContextMenus.find(
      ({ command }) => command.name === interaction.commandName
    )
    logCommand(client, interaction, interaction.commandName)
    await handleCommand(client, interaction, command?.handler)
  }
}
