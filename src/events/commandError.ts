import {
  BaseCommandInteraction,
  DiscordAPIError,
  FileOptions,
  GuildChannel,
  TextChannel,
} from 'discord.js'
import { RolePanelError } from '../types/error'
import { RolePanelClient } from '../types/client'
import { CHANNEL_TRACEBACK } from '../const'
import { channel } from 'diagnostics_channel'

export async function onCommandError(
  client: RolePanelClient,
  interaction: BaseCommandInteraction,
  error: unknown
) {
  let content = ''
  if (error instanceof RolePanelError) {
    content = error.response
  } else if (error instanceof DiscordAPIError) {
    switch (error.code) {
      case 10008:
        content =
          'メッセージが見つかりませんでした。もう一度パネルを選択し直してください。'
        break
      case 10014:
        content =
          'この絵文字はリアクションとして付与できません。\n別な絵文字を指定してください。'
        break
      case 50001:
      case 50013:
        content =
          '権限不足です。以下の権限があるかもう一度確認してください。\n' +
          '・メッセージを送信\n・埋め込みリンク\n' +
          '・メッセージ履歴を読む\n・リアクションを追加'
        break
    }
    // Todo: Error Handler
  }

  // エラーメッセージ未定義 or 未想定エラー
  if (!content) {
    let ok = false
    if (error instanceof Error && error.stack) {
      const errorDetails =
        `サーバー: ${interaction!.guild!.name}(ID:${interaction!.guildId!})\n` +
        `チャンネル: ${
          (interaction!.channel as GuildChannel).name ?? `不明`
        }(ID:${interaction!.channelId!})\n` +
        `ユーザー: ${interaction!.user.tag}(ID:${interaction!.user.id})\n` +
        `コマンド: ${interaction!.commandName}\n` +
        // `コマンドオプション: ${interaction!.options.data.map((optionData) => {return `${optionData.name}: ${optionData.value}`;}).toString()}\n` + //書き方が正しいか不明なため保留
        `エラー内容: ${error.stack}`
      const buf = Buffer.from(errorDetails)
      const file: FileOptions = {
        attachment: buf,
        name: `${interaction.id}.txt`,
      }
      try {
        const channel = await client.channels.fetch(CHANNEL_TRACEBACK, {
          allowUnknownGuild: true,
        })
        if (channel instanceof TextChannel) {
          await channel.send({
            files: [file],
          })
          ok = true
        }
      } catch (e) {
        console.error(e)
      }
      if (!ok) {
        console.error(errorDetails)
      }
    }
    content = '何らかの想定されていないエラーが発生しました。'
    content += ok
      ? 'エラーはトレースバックされました。サポートサーバーにお問い合わせください。'
      : 'エラーがトレースバックされませんでした。'
  }
  try {
    await interaction.editReply({ content: content })
  } catch {}
}
