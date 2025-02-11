import {
  BaseCommandInteraction,
  CommandInteraction,
  ContextMenuInteraction,
  Snowflake,
} from 'discord.js'
import { RolePanelClient } from './client'

export type WithGuild<T> = T & { guildId: Snowflake }

export type CommandHandler = (
  client: RolePanelClient,
  interaction: CommandInteraction
) => Promise<void>
export type CommandHandlerWithGuild = (
  client: RolePanelClient,
  interaction: CommandInteraction<'cached'>
) => Promise<void>
export type ContextHandlerWithGuild = (
  client: RolePanelClient,
  interaction: ContextMenuInteraction<'cached'>
) => Promise<void>
type BaseCommandHandlerWithGuild = (
  client: RolePanelClient,
  interaction: BaseCommandInteraction<'cached'>
) => Promise<void>

export type HandlerWithGuild<T extends BaseCommandInteraction> =
  T extends ContextMenuInteraction
    ? ContextHandlerWithGuild
    : T extends CommandInteraction
    ? CommandHandlerWithGuild
    : BaseCommandHandlerWithGuild
