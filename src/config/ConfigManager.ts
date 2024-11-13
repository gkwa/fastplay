import dotenv from "dotenv"
import path from "path"

export interface Credentials {
  username: string
  password: string
}

export class ConfigManager {
  constructor(envPath: string) {
    if (
      !process.env.ASTOUND_BROADBAND_LOGIN_USERNAME ||
      !process.env.ASTOUND_BROADBAND_LOGIN_PASSWORD
    ) {
      const envFile = path.resolve(process.cwd(), envPath)
      const result = dotenv.config({ path: envFile })

      if (result.error && !this.isMockTest()) {
        throw new Error(
          `Unable to load environment variables from ${envFile}. Please ensure this file exists and contains ASTOUND_BROADBAND_LOGIN_USERNAME and ASTOUND_BROADBAND_LOGIN_PASSWORD variables.`,
        )
      }
    }
  }

  private isMockTest(): boolean {
    return process.argv.some((arg) => arg.includes("astound.mock.spec.ts"))
  }

  getCredentials(): Credentials {
    const username = process.env.ASTOUND_BROADBAND_LOGIN_USERNAME || "test"
    const password = process.env.ASTOUND_BROADBAND_LOGIN_PASSWORD || "test"

    if (!this.isMockTest() && (!username || !password)) {
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
