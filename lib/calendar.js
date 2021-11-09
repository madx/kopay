import { calendar, auth } from "@googleapis/calendar"

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } =
  process.env

export async function connectCalendar(bot) {
  const oauthClient = await getOAuthClient(bot)

  bot.calendar = calendar({
    version: "v3",
    auth: oauthClient,
  })
}

async function getOAuthClient(bot) {
  const oauthClient = new auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URL
  )

  oauthClient.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      await bot.db
        .from("settings")
        .update({ googleRefreshToken: tokens.refresh_token })
    }
  })

  if (bot.settings.googleRefreshToken !== null) {
    oauthClient.setCredentials({
      refresh_token: bot.settings.googleRefreshToken,
    })
    bot.logger.info("Using existing Google token")
    return oauthClient
  }

  let authorizationCode = null

  bot.web.get("/oauth/callback", async (request, response) => {
    authorizationCode = request.query.code
    response.send("ok")
  })

  const scopes = ["https://www.googleapis.com/auth/calendar"]
  const url = oauthClient.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  })

  bot.logger.info(`Authorize the app to connect the calendar: ${url}`)

  await new Promise((resolve) => {
    function checkCode() {
      if (authorizationCode !== null) {
        return resolve()
      }
      setTimeout(checkCode, 200)
    }

    checkCode()
  })

  const { tokens } = await oauthClient.getToken(authorizationCode)
  oauthClient.setCredentials(tokens)

  return oauthClient
}
