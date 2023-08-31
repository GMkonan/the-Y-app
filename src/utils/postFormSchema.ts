import { z } from "zod";

const postFormSchema = z.object({
  content: z
    .string()
    .min(1, "Not even an emoji?")
    .max(56, "Writing the bible? 56 Chars MAX 💩"),
});

export default postFormSchema;
