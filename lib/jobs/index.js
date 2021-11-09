import cron from "node-cron"
import translateToCron from "friendly-node-cron"

import { importSiblingModules } from "../utils.js"

export async function startJobs(bot) {
  bot.jobs = await importSiblingModules(import.meta.url)

  for (const job of bot.jobs) {
    const schedule = translateToCron(job.schedule)
    cron.schedule(schedule, () => job.run(bot))

    if (!job.skipInitial) {
      bot.logger.info(`Initial run for ${job.name}`)
      await job.run(bot)
    }
  }

  bot.logger.info(`Started jobs: ${bot.jobs.map((j) => j.name).join(", ")}`)
}
