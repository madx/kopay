import {
  endOfDay,
  formatRFC3339,
  formatRelative,
  isMonday,
  nextMonday,
  previousMonday,
  startOfDay,
} from "date-fns"
import { MessageEmbed } from "discord.js"

export default {
  name: "sunrise",
  schedule: "on workdays at 6:00",
  run: async (bot) => {
    const butlerChannel = await bot.discord.channels.fetch(
      bot.settings.butlerChannelId
    )

    const now = new Date()
    const getSchedule = isMonday(now) ? getWeeklySchedule : getDailySchedule
    const schedule = await getSchedule(bot, now)

    butlerChannel.send({ embeds: [schedule] })
  },
}

async function getWeeklySchedule(bot, now) {
  bot.logger.info("[sunrise] Fetching weekly schedule")
  const weekStart = startOfDay(previousMonday(now))
  const weekEnd = nextMonday(weekStart)

  const personalEvents = await fetchEvents(bot, "primary", weekStart, weekEnd)
  const workEvents = await fetchEvents(
    bot,
    bot.settings.workCalendarIr,
    weekStart,
    weekEnd
  )

  return createEmbed({
    description: "Here's your planning for this week:",
    personalEvents,
    workEvents,
    reference: weekStart,
  })
}

async function getDailySchedule(bot, now) {
  bot.logger.info("[sunrise] Fetching daily schedule")
  const dayStart = startOfDay(now)
  const dayEnd = endOfDay(now)

  const personalEvents = await fetchEvents(bot, "primary", dayStart, dayEnd)
  const workEvents = await fetchEvents(
    bot,
    bot.settings.workCalendarId,
    dayStart,
    dayEnd
  )

  return createEmbed({
    description: "Here's your planning for today:",
    personalEvents,
    workEvents,
    reference: dayStart,
  })
}

async function fetchEvents(bot, calendarId, min, max) {
  const {
    data: { items },
  } = await bot.calendar.events.list({
    calendarId,
    singleEvents: true,
    orderBy: "startTime",
    timeMin: formatRFC3339(min),
    timeMax: formatRFC3339(max),
  })

  return items
}

function formatEvents(events, reference) {
  return events
    .filter((event) => event.eventType !== "outOfOffice")
    .map((event) => formatEvent(event, reference))
    .join("\n")
}

function formatEvent(event, reference) {
  const startTime = new Date(event.start?.dateTime || event.start.date)

  return `- **[${event.summary}](${event.htmlLink})** ${formatRelative(
    startTime,
    reference
  )}`
}

function createEmbed({ description, personalEvents, workEvents, reference }) {
  const embed = new MessageEmbed()
    .setColor("#f5d742")
    .setTitle("🌅  Good morning!  🌅")
    .setDescription(description)
    .setURL("https://calendar.google.com/")

  if (personalEvents.length) {
    embed.addField("__PERSONAL__", formatEvents(personalEvents, reference))
  }

  if (workEvents.length) {
    embed.addField("__WORK__", formatEvents(workEvents, reference))
  }

  if (!personalEvents.length && !workEvents.length) {
    embed.setDescription("Calendar all clear for today! Enjoy :sunglasses:")
  }

  return embed
}
