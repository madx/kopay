import { Collection } from "discord.js"
import { omit, importSiblingModules } from "../utils.js"

export async function setupCommands(bot) {
  const { guild, settings } = bot

  const commandList = await importSiblingModules(import.meta.url)

  const { id: atEveryoneId } = guild.roles.cache.find(
    (role) => role.name === "@everyone"
  )

  // Create commands, private by default
  const guildCommands = await guild.commands.set(
    commandList.map((command) => ({
      ...omit(command, ["execute", "public"]),
      defaultPermission: false,
    }))
  )

  // Update commands permissions
  const fullPermissions = commandList
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
    `Enabled commands: ${commandList.map((c) => c.name).join(", ")}`
  )

  bot.commands = new Collection(
    commandList.map((command) => [command.name, command])
  )
}
