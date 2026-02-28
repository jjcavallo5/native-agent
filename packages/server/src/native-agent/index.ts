import { click } from '@native-agent/core'

export const getServer = () => {
  return Bun.serve({
    port: 8647,
    hostname: "0.0.0.0",
    routes: {
      "/": () => Response.json({ success: true }, { status: 200 }),
      "/click": () => Response.json({ success: true }, { status: 200 }),
      "/tap": () => Response.json({ success: true }, { status: 200 }),
      "/type": () => Response.json({ success: true }, { status: 200 }),
      "/swipe": () => Response.json({ success: true }, { status: 200 }),
      "/view": () => Response.json({ success: true }, { status: 200 }),
      "/get-size": () => Response.json({ success: true }, { status: 200 }),
    }
  })
}
