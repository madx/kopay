import path from "path"
import { fileURLToPath } from "url"
import { readdir } from "fs/promises"

export function omit(source, excludedKeys) {
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => !excludedKeys.includes(key))
  )
}

export async function importSiblingModules(importMetaUrl) {
  const callerFilePath = fileURLToPath(importMetaUrl)
  const callerDirPath = path.dirname(callerFilePath)
  const files = await readdir(callerDirPath)

  const modulesToLoad = files
    .filter((f) => f !== path.basename(callerFilePath))
    .map((file) => path.join(callerDirPath, file))

  return await Promise.all(
    modulesToLoad.map(
      async (moduleToLoad) => (await import(moduleToLoad)).default
    )
  )
}
