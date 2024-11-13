import { test } from "@playwright/test"
import { AstoundTestRunner } from "../src/services/AstoundTestRunner"

test.describe("Astound", () => {
  test("login and scrape usage", async ({ page }) => {
    const runner = new AstoundTestRunner({})
    await runner.run({ page })
  })
})
