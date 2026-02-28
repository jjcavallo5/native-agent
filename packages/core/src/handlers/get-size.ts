import { type Browser } from "webdriverio";

export const getSize = async ({ driver }: { driver: Browser }) => {
  const size = await driver.getWindowSize();
  return Response.json(size, { status: 200 })
}
