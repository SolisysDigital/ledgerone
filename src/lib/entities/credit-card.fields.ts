import { z } from "zod";

export const CreditCardSchema = z.object({
  id: z.string().uuid(),
  cardholder_name: z.string().min(1),
  card_number: z.string().min(1),
  issuer: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  institution_held_at: z.string().optional().nullable(),
  purpose: z.string().optional().nullable(),
  last_balance: z.number().or(z.string()), // allow formatted to/from
  short_description: z.string().max(50).optional().nullable(),
  description: z.string().optional().nullable(),
  // timestamps, etc.
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  user_id: z.string().optional(),
});

export type CreditCard = z.infer<typeof CreditCardSchema>;

export const creditCardDisplayFields: Array<keyof CreditCard> = [
  "cardholder_name",
  "card_number",
  "issuer",
  "type",
  "institution_held_at",
  "purpose",
  "last_balance",
  "short_description",   // <-- ensures it renders on Details
  "description",
];

export const creditCardFormFields: Array<keyof CreditCard> = [
  "cardholder_name",
  "card_number",
  "issuer",
  "type",
  "institution_held_at",
  "purpose",
  "last_balance",
  "short_description",   // <-- ensures it renders on Edit
  "description",
];
