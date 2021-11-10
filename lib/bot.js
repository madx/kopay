import { Client, Collection, Intents } from "discord.js"

import logger from "./logger.js"
import { createSupabase } from "./supabase.js"
import { createWebserver } from "./web.js"
import { connectCalendar } from "./calendar.js"
import { startJobs } from "./jobs/index.js"
import { setupCommands } from "./commands/index.js"

import * as filters from "./filters/index.js"

const { DISCORD_API_TOKEN } = process.env
const BOT_INTENTS = [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]

export function createBot() {
  const bot = {
    logger,
    discord: new Client({ intents: BOT_INTENTS }),
    guild: null,
    settings: null,
    commands: new Collection(),
    jobs: [],
    db: createSupabase(),
    web: createWebserver(logger),
    filters: Object.values(filters),
  }

  async function onReady() {
    const { application } = bot.discord

    if (!application?.owner) {
      await application?.fetch()
    }

    bot.guild = bot.discord.guilds.cache.first()

    try {
      await setupCommands(bot)
      await connectCalendar(bot)
      await startJobs(bot)
    } catch (error) {
      bot.logger.fatal(error)
      process.exit(1)
    }

    bot.logger.info("🐀 I'm up!")
  }

  async function onInteractionCreate(interaction) {
    const { commands } = bot

    if (interaction.isCommand() && commands.has(interaction.commandName)) {
      return commands.get(interaction.commandName).execute(interaction, bot)
    }

    return null
  }

  async function onMessage(message) {
    for (const filter of bot.filters) {
      if (
        filter?.matches(message, bot) &&
        message.author !== bot.discord.user
      ) {
        try {
          await filter.process(message, bot)
        } catch (error) {
          bot.logger.error(`Error while processing filter ${filter.name}`)
          console.error(error)
        }
      }
    }
  }

  async function start() {
    const { data: settings } = await bot.db.from("settings").select().single()
    bot.settings = settings

    bot.discord.on("interactionCreate", onInteractionCreate)
    bot.discord.on("messageCreate", onMessage)
    bot.discord.once("ready", onReady)
    bot.discord.login(DISCORD_API_TOKEN)

    bot.web.listen(3000)
  }

  return { start }
}
