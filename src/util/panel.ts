import { Client, Message, MessageEmbed } from 'discord.js'
import { APIMessage } from 'discord-api-types/v9'

const pattern = /役職パネル\((.+?)\)\((\d+?)ページ目\)/
const panelFotterName = '役職パネル'

export type Panel = {
  tag: string
  page: number
}

export function setPanel(embed: MessageEmbed) {
  embed.setFooter({ text: panelFotterName })
}

export function isPanel(client: Client, message: Message): boolean {
  return (
    message.author.id === client.user?.id &&
    message.embeds.at(0)?.footer?.text === panelFotterName
  )
}

export function isV2Panel(message: Message | APIMessage): boolean {
  return !!(
    message.author.id === '682774762837377045' &&
    message.embeds.at(0)?.title?.startsWith('役職パネル')
  )
}

export function isOldv3Panel(message: Message | APIMessage): boolean {
  return (
    (message.author.id === '895912135039803402' ||
      message.author.id === '971523089550671953' ||
      message.author.id === '1137367652482957313') &&
    message.embeds.at(0)?.footer?.text === '役職パネル'
  )
}

export function getPanel(client: Client, message: Message): Panel | null {
  if (message === null || message.author.id !== client.user?.id) {
    return null
  }
  const title = message.embeds[0]?.title
  if (!title) {
    return null
  }
  const match = pattern.exec(title)
  if (match === null) {
    return null
  }
  return {
    tag: match[1],
    page: Number(match[2]),
  }
}

export function createPanelTitle(panel: Panel): string {
  return `役職パネル(${panel.tag})(${panel.page}ページ目)`
}
