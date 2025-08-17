import { z } from "zod";

export const BankAccountSchema = z.object({
  id: z.string().uuid(),
  bank_name: z.string().min(1),
  account_number: z.string().optional().nullable(),
  routing_number: z.string().optional().nullable(),
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

export type BankAccount = z.infer<typeof BankAccountSchema>;

export const bankAccountDisplayFields: Array<keyof BankAccount> = [
  "bank_name",
  "account_number",
  "routing_number",
  "institution_held_at",
  "purpose",
  "last_balance",
  "short_description",   // <-- ensures it renders on Details
  "description",
];

export const bankAccountFormFields: Array<keyof BankAccount> = [
  "bank_name",
  "account_number",
  "routing_number",
  "institution_held_at",
  "purpose",
  "last_balance",
  "short_description",   // <-- ensures it renders on Edit
  "description",
];
