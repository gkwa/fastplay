import dotenv from "dotenv"
import path from "path"

export interface Credentials {
  username: string
  password: string
}

export class ConfigManager {
  constructor(envPath: string) {
    try {
      dotenv.config({ path: path.resolve(process.cwd(), envPath) })
    } catch {}
  }

  private isMockTest(): boolean {
    return process.argv.some((arg) => arg.includes("astound.mock.spec.ts"))
  }

  getCredentials(): Credentials {
    let username = process.env.ASTOUND_BROADBAND_LOGIN_USERNAME
    let password = process.env.ASTOUND_BROADBAND_LOGIN_PASSWORD

    if (!username || !password) {
      username = "test"
      password = "test"
    }

    if (!this.isMockTest() && (!username || !password)) {
      throw new Error(
        "Missing required environment variables ASTOUND_BROADBAND_LOGIN_USERNAME and/or ASTOUND_BROADBAND_LOGIN_PASSWORD",
      )
    }

    return { username, password }
  }

  getDataDirectory(): string {
    return path.join(__dirname, "../../data")
  }
}
