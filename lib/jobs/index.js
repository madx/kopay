import cron from "node-cron"
import translateToCron from "friendly-node-cron"

import { importSiblingModules } from "../utils.js"

export async function startJobs(bot) {
  bot.jobs = await importSiblingModules(import.meta.url)

  for (const job of bot.jobs) {
    const schedule = translateToCron(job.schedule)
    cron.schedule(schedule, async () => {
      try {
        await job.run(bot)
      } catch (error) {
        bot.logger.error(`Error while executing job ${job.name}`, error)
      }
    })

    if (job.runAtStartup) {
      bot.logger.info(`Running job ${job.name} at startup`)
      await job.run(bot)
    }
  }

  bot.logger.info(`Started jobs: ${bot.jobs.map((j) => j.name).join(", ")}`)
}
