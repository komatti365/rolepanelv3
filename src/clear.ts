import { clearCommand } from './commands/init'

async function main() {
  await clearCommand(process.env.BOT_TOKEN as string, process.env.GUILD_ID)
}

main()
