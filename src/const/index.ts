export const BOT_TOKEN: string = process.env.BOT_TOKEN ?? ''
export const GUILD_ID: string[] = process.env.GUILD_ID?.split(',') ?? []
export const CHANNEL_LOG = process.env.CHANNEL_LOG ?? ''
export const CHANNEL_TRACEBACK = process.env.CHANNEL_TRACEBACK ?? ''
export const JOIN_MESSAGE =
  process.env.IS_PTB === '0' ?? false
    ? 'PTBバージョンではないときの参加時メッセージ'
    : 'PTBバージョンのときの参加時メッセージ'
