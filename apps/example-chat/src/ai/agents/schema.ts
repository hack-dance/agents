import { z } from "zod"

export const schema = z.object({
  listOfRandomNames: z.array(z.string()),
  listOfRandomNumbers: z.array(z.number()),
  aRandomThought: z.string(),
  aGoodThing: z.object({
    name: z.string(),
    aNestedThing: z.object({
      aGreeting: z.string(),
      aNumber: z.number()
    })
  }),
  twoGoodThings: z.array(
    z.object({
      name: z.string(),
      whyItsGood: z.string(),
      howGoodIsIt: z.number()
    })
  )
})
