import { z } from "zod";

export const HostingAccountSchema = z.object({
  id: z.string().uuid(),
  provider: z.string().min(1),
  login_url: z.string().optional().nullable(),
  username: z.string().optional().nullable(),
  password: z.string().optional().nullable(),
  short_description: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable(),
  // timestamps, etc.
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  user_id: z.string().optional(),
});

export type HostingAccount = z.infer<typeof HostingAccountSchema>;

export const hostingAccountDisplayFields: Array<keyof HostingAccount> = [
  "provider",
  "login_url",
  "username",
  "password",
  "short_description",   // <-- ensures it renders on Details
  "description",
];

export const hostingAccountFormFields: Array<keyof HostingAccount> = [
  "provider",
  "login_url",
  "username",
  "password",
  "short_description",   // <-- ensures it renders on Edit
  "description",
];
