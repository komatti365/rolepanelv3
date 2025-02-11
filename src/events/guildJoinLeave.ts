import { RolePanelClient } from '../types/client'
import { ClientEvents } from 'discord.js'
import { JOIN_MESSAGE } from '../const'

export async function onGuildJoin(
  client: RolePanelClient,
  [guild]: ClientEvents['guildCreate']
) {
  try {
    const owner = await guild.members.fetch(guild.ownerId)
    await owner.send(JOIN_MESSAGE)
  } catch (e) {}
  client.log(`[GUILD-ENTER] guild:\`${guild.name} (ID:${guild.id})\``)
}

export async function onGuildLeave(
  client: RolePanelClient,
  [guild]: ClientEvents['guildDelete']
) {
  client.log(`[GUILD-LEAVE] guild:\`${guild.name} (ID:${guild.id})\``)
}
