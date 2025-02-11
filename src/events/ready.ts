import { ClientEvents } from 'discord.js'
// import { initStopCommand } from '../commands/stop'
import { RolePanelClient } from '../types/client'

export async function onReady(
  client: RolePanelClient,
  []: ClientEvents['ready']
) {
  // await initStopCommand(client)
  client.log(`[BOOT] name:\`${client.user!.username}(ID:${client.user!.id})\``)
}
