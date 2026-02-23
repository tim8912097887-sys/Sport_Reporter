import { env } from "@configs/env.js";
import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";


export const httpArcjet = arcjet({
    key: env.ARCJET_KEY,
    rules: [
        shield({
            mode: env.ARCJET_MODE,
        }),
        detectBot({
            mode: env.ARCJET_MODE,
            allow: ['CATEGORY:SEARCH_ENGINE','CATEGORY:PREVIEW']
        }),
        slidingWindow({
            mode: env.ARCJET_MODE,
            interval: '10s',
            max: 5
        })
    ]
})

export const socketArcjet = arcjet({
    key: env.ARCJET_KEY,
    rules: [
        shield({
            mode: env.ARCJET_MODE,
        }),
        detectBot({
            mode: env.ARCJET_MODE,
            allow: ['CATEGORY:SEARCH_ENGINE','CATEGORY:PREVIEW']
        }),
        slidingWindow({
            mode: env.ARCJET_MODE,
            interval: '2s',
            max: 5
        })
    ]
})