import { nanoid } from "nanoid";
import { z } from "zod";
const nanoidSchema = z.string().min(7).optional().default(() => nanoid());
export {
  nanoidSchema
};
//# sourceMappingURL=nanoid.js.map
