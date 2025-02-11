import {
  AnyChannel,
  Client,
  ClientOptions,
  Guild,
  GuildMember,
  Message,
  Role,
  Snowflake,
  TextChannel,
} from 'discord.js'
import {
  ChannelIsNotTextChannel,
  ChannelNotFound,
  GuildNotFound,
  MemberNotFound,
  RoleNotFound,
} from './error'
import { onReactionAdd } from '../events/reactionAdd'
import { onInteractionCreate } from '../events/interactionCreate'
import { getPanel } from '../util/panel'
import { onReady } from '../events/ready'
import { CHANNEL_LOG } from '../const'
import { onGuildJoin, onGuildLeave } from '../events/guildJoinLeave'

function isTextChannel(channel: AnyChannel): channel is TextChannel {
  return channel.type == 'GUILD_TEXT'
}

export class RolePanelClient extends Client {
  constructor(option: ClientOptions) {
    super(option)
    this.on('messageReactionAdd', async (...args) => {
      try {
        await onReactionAdd(this, args)
      } catch (e) {
        console.error(e)
      }
    })
    this.on('interactionCreate', async (...args) => {
      try {
        await onInteractionCreate(this, args)
      } catch (e) {
        console.error(e)
      }
    })
    this.on('ready', async (...args) => {
      try {
        await onReady(this, args)
      } catch (e) {
        console.error(e)
      }
    })
    this.on('guildCreate', async (...args) => {
      try {
        await onGuildJoin(this, args)
      } catch (e) {
        console.error(e)
      }
    })
    this.on('guildDelete', async (...args) => {
      try {
        await onGuildLeave(this, args)
      } catch (e) {
        console.error(e)
      }
    })
  }

  public log(content: string) {
    try {
      this.channels
        .fetch(CHANNEL_LOG, { allowUnknownGuild: true })
        .then((channel) => {
          if (channel instanceof TextChannel) {
            channel.send(content).catch(console.error)
          }
        })
    } catch {}
  }

  public async fetchTextChannel(id: Snowflake): Promise<TextChannel> {
    const ret = await this.channels.fetch(id, { force: false })
    if (ret === null) {
      throw new ChannelNotFound({ id })
    } else if (!isTextChannel(ret)) {
      throw new ChannelIsNotTextChannel({ id })
    }
    return ret
  }
  public async fetchGuild(id: Snowflake): Promise<Guild> {
    const ret = await this.guilds.fetch({ guild: id, force: false })
    if (ret === null) {
      throw new GuildNotFound({ id })
    }
    return ret
  }

  public async fetchRole(guild: Guild, roleId: Snowflake): Promise<Role> {
    const entity = await guild.roles.fetch(roleId, { force: false })
    if (entity === null) {
      throw new RoleNotFound({ id: roleId })
    }
    return entity
  }

  public async fetchMember(
    guild: Guild,
    memberId: Snowflake
  ): Promise<GuildMember> {
    const entity = await guild.members.fetch({ user: memberId, force: false })
    if (entity === null) {
      throw new MemberNotFound({ id: memberId })
    }
    return entity
  }

  public async fetchMessage(
    channelId: Snowflake,
    messageId: Snowflake
  ): Promise<Message> {
    const channel = await this.fetchTextChannel(channelId)
    return channel.messages.fetch(messageId)
  }

  public checkIsPanel(tag: string | null) {
    return (m: Message) => {
      const panel = getPanel(this, m)
      return !!(panel && (!tag || panel.tag == tag))
    }
  }
}
