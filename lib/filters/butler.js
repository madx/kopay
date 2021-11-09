import shellwords from "shellwords"
import {
  formatRelative,
  formatRFC3339,
  startOfDay,
  previousMonday,
  nextMonday,
} from "date-fns"
import { MessageEmbed } from "discord.js"

export default {
  name: "butler",

  matches(message, bot) {
    // return true
    return message.channelId === bot.settings.butlerChannelId
  },

  async process(message, bot) {
    const words = shellwords.split(message.content)
    const [firstWord, ...rest] = words

    switch (firstWord) {
      case "sunrise": {
        const now = new Date()
        const weekStart = startOfDay(previousMonday(now))
        const weekEnd = nextMonday(weekStart)

        const {
          data: { items: personalItems },
        } = await bot.calendar.events.list({
          calendarId: "primary",
          singleEvents: true,
          orderBy: "startTime",
          timeMin: formatRFC3339(weekStart),
          timeMax: formatRFC3339(weekEnd),
        })

        const {
          data: { items: workItems },
        } = await bot.calendar.events.list({
          calendarId: "francois.vaux@memo.bank",
          singleEvents: true,
          orderBy: "startTime",
          timeMin: formatRFC3339(weekStart),
          timeMax: formatRFC3339(weekEnd),
        })

        const formatItem = (item) => {
          const startTime = new Date(item.start?.dateTime || item.start.date)
          return `- **${item.summary}** ${formatRelative(startTime, weekStart)}`
        }

        const embed = new MessageEmbed()
          .setColor("#f5d742")
          .setTitle("🌅  Good morning!  🌅")
          .setDescription("Here's your planning for this week:")
          .setURL("https://calendar.google.com/")
          .addFields(
            {
              name: "__PERSONAL__",
              value: personalItems.map(formatItem).join("\n"),
            },
            {
              name: "__WORK__",
              value: workItems
                .filter((item) => item.eventType !== "outOfOffice")
                .map(formatItem)
                .join("\n"),
            }
          )

        message.reply({ embeds: [embed] })

        break
      }

      case "remind":
        break

      case "jobs":
        break

      case "jobs":
        break
    }
  },
}
