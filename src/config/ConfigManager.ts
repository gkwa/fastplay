import dotenv from "dotenv"
import path from "path"

export interface Credentials {
  username: string
  password: string
}

const CONFIG = {
  prod: {
    dataDir: "data",
    requireCreds: true,
  },
  test: {
    dataDir: "testdata",
    requireCreds: false,
  },
}

export class ConfigManager {
  private readonly config: typeof CONFIG.prod | typeof CONFIG.test

  constructor(envPath: string) {
    try {
      dotenv.config({ path: path.resolve(process.cwd(), envPath) })
    } catch {}

    const configType = process.env.ASTOUND_CONFIG === "test" ? "test" : "prod"
    this.config = CONFIG[configType]
  }

  getCredentials(): Credentials {
    let username = process.env.ASTOUND_BROADBAND_LOGIN_USERNAME
    let password = process.env.ASTOUND_BROADBAND_LOGIN_PASSWORD

    if (!username || !password) {
      username = "test"
      password = "test"
    }

    if (this.config.requireCreds && (!username || !password)) {
      throw new Error(
        "Missing required environment variables ASTOUND_BROADBAND_LOGIN_USERNAME and/or ASTOUND_BROADBAND_LOGIN_PASSWORD",
      )
    }

    return { username, password }
  }

  getDataDirectory(): string {
    return path.join(process.cwd(), this.config.dataDir)
  }
}
