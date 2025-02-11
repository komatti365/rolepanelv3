import { RolePanelClient } from './types/client'
import { Intents } from 'discord.js'
import { BOT_TOKEN } from './const'

process.on('unhandledRejection', (reason) => {
  console.error(reason)
})

const client = new RolePanelClient({
  intents:
    2 ** 16 -
    1 -
    Intents.FLAGS.GUILD_PRESENCES -
    Intents.FLAGS.GUILD_MEMBERS -
    (1 << 15), // MESSAGE_CONTENT
  partials: ['REACTION', 'MESSAGE', 'GUILD_MEMBER'],
})

;(async () => {
  await client.login(BOT_TOKEN)
})()
