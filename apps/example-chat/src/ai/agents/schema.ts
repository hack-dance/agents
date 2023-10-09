import { z } from "zod"

export const schema = z.object({
  listOfRandomNames: z.array(z.string()),
  listOfRandomNumbers: z.array(z.number()),
  aRandomThought: z.string(),
  aGoodThing: z.object({
    name: z.string(),
    aNestedThing: z.object({
      aGreeting: z.string()
    })
  }),
  twoGoodThings: z.array(
    z.object({
      name: z.string(),
      aNestedThing: z.object({
        aGreeting: z.string()
      })
    })
  )
})
