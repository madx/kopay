import logger from "./logger.js"

export function checkEnvironment() {
  const required = [
    "DISCORD_API_TOKEN",
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ]
  const missing = required.filter((variable) => !process.env[variable])

  if (missing.length) {
    const s = missing.length > 1 ? "s" : ""
    logger.fatal(`Missing environment variable${s}: ${missing.join(", ")}`)
  }
}
