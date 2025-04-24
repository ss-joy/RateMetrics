import { z } from "zod";

export const ratingsSchema = z.object({
  userId: z.number().int(),
  productId: z.number().int(),
  shopId: z.number().int(),
  shopDomain: z.string(),
  rateValue: z.number().int(),
});
