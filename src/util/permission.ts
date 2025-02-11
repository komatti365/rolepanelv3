import { GuildMember, Permissions, Role } from 'discord.js'
import { UseHigherRole, YouDontHaveRoleManagement } from '../types/error'

export function hasRoleManagement(member: GuildMember) {
  const permissions = [Permissions.FLAGS.MANAGE_ROLES]
  if (!member.permissions.has(permissions)) {
    throw new YouDontHaveRoleManagement()
  }
}

export function canUseRoleArgument(member: GuildMember, role: Role) {
  if (member.guild.ownerId === member.id) {
    return
  }
  hasRoleManagement(member)
  if (member.roles.highest.position <= role.position) {
    throw new UseHigherRole({ role })
  }
}
