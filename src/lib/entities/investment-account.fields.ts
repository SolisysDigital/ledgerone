import { z } from "zod";

export const InvestmentAccountSchema = z.object({
  id: z.string().uuid(),
  provider: z.string().min(1),
  account_type: z.string().optional().nullable(),
  account_number: z.string().optional().nullable(),
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

export type InvestmentAccount = z.infer<typeof InvestmentAccountSchema>;

export const investmentAccountDisplayFields: Array<keyof InvestmentAccount> = [
  "provider",
  "account_type",
  "account_number",
  "institution_held_at",
  "purpose",
  "last_balance",
  "short_description",   // <-- ensures it renders on Details
  "description",
];

export const investmentAccountFormFields: Array<keyof InvestmentAccount> = [
  "provider",
  "account_type",
  "account_number",
  "institution_held_at",
  "purpose",
  "last_balance",
  "short_description",   // <-- ensures it renders on Edit
  "description",
];
