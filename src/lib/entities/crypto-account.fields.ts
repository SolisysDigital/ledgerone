import { z } from "zod";

export const CryptoAccountSchema = z.object({
  id: z.string().uuid(),
  platform: z.string().min(1),
  account_number: z.string().optional().nullable(),
  wallet_address: z.string().optional().nullable(),
  institution_held_at: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  last_balance: z.number().or(z.string()).optional().nullable(),
  short_description: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable(),
  // timestamps, etc.
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  user_id: z.string().optional(),
});

export type CryptoAccount = z.infer<typeof CryptoAccountSchema>;

export const cryptoAccountDisplayFields: Array<keyof CryptoAccount> = [
  "platform",
  "account_number",
  "wallet_address",
  "institution_held_at",
  "purpose",
  "last_balance",
  "short_description",   // <-- ensures it renders on Details
  "description",
];

export const cryptoAccountFormFields: Array<keyof CryptoAccount> = [
  "platform",
  "account_number",
  "wallet_address",
  "institution_held_at",
  "purpose",
  "last_balance",
  "short_description",   // <-- ensures it renders on Edit
  "description",
];
