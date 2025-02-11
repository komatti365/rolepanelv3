import { initCommand } from './commands/init'
import { BOT_TOKEN, GUILD_ID } from './const'

async function main() {
  const guildIds = (<Array<string | undefined>>[undefined]).concat(GUILD_ID)
  await initCommand(BOT_TOKEN, ...guildIds)
}

main()
