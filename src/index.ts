import { ShardingManager, Util } from 'discord.js'
import { BOT_TOKEN } from './const'

process.on('unhandledRejection', (reason) => {
  console.error(reason)
})

async function main() {
  const amount = await Util.fetchRecommendedShards(BOT_TOKEN)
  const manager = new ShardingManager(`${__dirname}/bot.js`, {
    token: BOT_TOKEN,
    mode: 'worker',
    respawn: true,
  })
  await manager.spawn({ timeout: 35_000 * amount })
}

main()
