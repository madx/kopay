import { omit, importSiblingModules } from "../utils.js"

export async function setupCommands(bot) {
  const { guild, settings } = bot

  bot.commands = await importSiblingModules(import.meta.url)

  const { id: atEveryoneId } = guild.roles.cache.find(
    (role) => role.name === "@everyone"
  )

  // Create commands, private by default
  const guildCommands = await guild.commands.set(
    bot.commands.map((command) => ({
      ...omit(command, ["execute", "public"]),
      defaultPermission: false,
    }))
  )

  // Update commands permissions
  const fullPermissions = bot.commands
    .map((command) => {
      const permissions = [
        {
          id: settings.ownerId,
          type: "USER",
          permission: true,
        },
        command.public && {
          id: atEveryoneId,
          type: "ROLE",
          permission: true,
        },
      ].filter(Boolean)

      const guildCommand = guildCommands.find((c) => c.name === command.name)

      return {
        id: guildCommand.id,
        permissions,
      }
    })
    .filter(({ permissions }) => Boolean(permissions))

  if (fullPermissions.length > 0) {
    await guild.commands.permissions.set({ fullPermissions })
  }

  bot.logger.info(
    `Enabled commands: ${bot.commands.map((c) => c.name).join(", ")}`
  )
}
