import { NoSelectedPanel } from '../types/error'
import { CommandHandlerWithGuild } from '../types/command'
import { SlashCommandSubcommandBuilder } from '@discordjs/builders'
import { selectedMessage } from './select'

export const command = new SlashCommandSubcommandBuilder()
  .setName('selected')
  .setDescription('現在選択されているパネルのリンクを返します')

export const handler: CommandHandlerWithGuild = async (client, interaction) => {
  let content
  try {
    const message = await selectedMessage.getFromInteraction(
      client,
      interaction
    )
    content = 'あなたは以下のパネルを選択しています。\n' + message.url
  } catch (e) {
    if (e instanceof NoSelectedPanel) {
      content = 'あなたはパネルを選択していません。'
    } else {
      throw e
    }
  }
  await interaction.editReply({ content: content })
}
