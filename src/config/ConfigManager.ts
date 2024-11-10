import dotenv from "dotenv"
import path from "path"

export interface Credentials {
  username: string
  password: string
}

export class ConfigManager {
  constructor(envPath: string) {
    dotenv.config({ path: path.resolve(__dirname, envPath) })
  }

  getCredentials(): Credentials {
    const username = process.env.ASTOUND_BROADBAND_LOGIN_USERNAME
    const password = process.env.ASTOUND_BROADBAND_LOGIN_PASSWORD

    if (!username || !password) {
      throw new Error("Missing required environment variables")
    }

    return { username, password }
  }

  getDataDirectory(): string {
    return path.join(__dirname, "../../data")
  }
}
