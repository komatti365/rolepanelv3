import { Role, Snowflake } from 'discord.js'
import { channelMention } from '@discordjs/builders'

// Todo: Messageの定義

export abstract class RolePanelError extends Error {
  // Todo: メッセージ全部定義できたらabstractにする
  abstract get response(): string
  // abstract get response(): string
}

export class NoPrivateMessage extends Error {}

abstract class FetchError extends RolePanelError {
  public id: Snowflake
  constructor(props: { id: Snowflake }) {
    super()
    this.id = props.id
  }
}

export class GuildNotFound extends FetchError {
  get response(): string {
    return `サーバー${this.id}が見つかりませんでした。`
  }
}
export class RoleNotFound extends FetchError {
  get response(): string {
    return `ロール${this.id}が見つかりませんでした。`
  }
}
export class MemberNotFound extends FetchError {
  get response(): string {
    return `メンバー${this.id}が見つかりませんでした。`
  }
}
export class ChannelNotFound extends FetchError {
  get response(): string {
    return `チャンネル${channelMention(this.id)}が見つかりませんでした。`
  }
}
export class ChannelIsNotTextChannel extends FetchError {
  get response(): string {
    return `チャンネル${channelMention(
      this.id
    )}はテキストチャンネルではありません。`
  }
}

export class UseHigherRole extends RolePanelError {
  public role: Role
  constructor(props: { role: Role }) {
    super()
    this.role = props.role
  }

  get response(): string {
    return (
      `${this.role.name}は、あなたの一番上の役職以上の役職であるため、追加/削除できません。\n` +
      `この役職以上の役職を持つメンバーまたはサーバーの所有者にコマンドを頼んでください。`
    )
  }
}

export class YouDontHaveRoleManagement extends RolePanelError {
  get response(): string {
    return `あなたに「役職の付与」の権限がないので、このコマンドを実行できません。`
  }
}

export class NoSelectedPanel extends RolePanelError {
  get response(): string {
    return 'パネルを選択していません。まずはコンテキストメニューからパネルを選択してください。'
  }
}

export class EmbedIsDeleted extends RolePanelError {
  get response(): string {
    return 'パネルのEmbedが削除されています。パネルを作成し直すか、既存のパネルを選択し直して下さい。'
  }
}

export class ColorParseError extends RolePanelError {
  reason: unknown
  constructor(reason: unknown) {
    super()
    this.reason = reason
  }
  get response(): string {
    return '色引数のパースに失敗しました'
  }
}
