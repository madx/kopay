#!/usr/bin/env node

import { checkEnvironment } from "../lib/env.js"
import { createBot } from "../lib/bot.js"

checkEnvironment()

await createBot().start()
