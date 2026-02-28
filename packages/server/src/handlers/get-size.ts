import { type Browser } from "webdriverio";

export const getSize = async ({ driver }: { driver: Browser }) => {
  try {
    console.log(`[GET]: /get-size`);
    const size = await driver.getWindowSize();
    return Response.json(size, { status: 200 });
  } catch (e) {
    console.error(`[GET]: /get-size failed`, e);
    return Response.json({ error: 'Get size failed' }, { status: 500 });
  }
}
