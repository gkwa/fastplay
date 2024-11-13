import { defineConfig, devices } from "@playwright/test"
import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.resolve(__dirname, ".env") })

if (!process.env.ASTOUND_BROADBAND_LOGIN_USERNAME) {
  process.env.ASTOUND_BROADBAND_LOGIN_USERNAME = "test"
}
if (!process.env.ASTOUND_BROADBAND_LOGIN_PASSWORD) {
  process.env.ASTOUND_BROADBAND_LOGIN_PASSWORD = "test"
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  timeout: 60000,
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
})
