import dotenv from "dotenv"
import path from "path"

export interface Credentials {
  username: string
  password: string
}

export class ConfigManager {
  constructor(envPath: string) {
    const envFile = path.resolve(process.cwd(), envPath)
    const result = dotenv.config({ path: envFile })

    if (result.error) {
      throw new Error(
        `Unable to load environment variables from ${envFile}. Please ensure this file exists and contains ASTOUND_BROADBAND_LOGIN_USERNAME and ASTOUND_BROADBAND_LOGIN_PASSWORD variables.`,
      )
    }
  }

  getCredentials(): Credentials {
    const username = process.env.ASTOUND_BROADBAND_LOGIN_USERNAME
    const password = process.env.ASTOUND_BROADBAND_LOGIN_PASSWORD

    if (!username || !password) {
      throw new Error(
        "Missing required environment variables ASTOUND_BROADBAND_LOGIN_USERNAME and/or ASTOUND_BROADBAND_LOGIN_PASSWORD in .env file",
      )
    }

    return { username, password }
  }

  getDataDirectory(): string {
    return path.join(__dirname, "../../data")
  }
}
