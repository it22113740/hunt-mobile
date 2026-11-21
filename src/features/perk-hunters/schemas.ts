import { z } from 'zod';

export const prizeSchema = z.object({
  title: z.string(),
  partner: z.string(),
  area: z.string(),
});

export type Prize = z.infer<typeof prizeSchema>;

export const levelSchema = z.object({
  number: z.number(),
  name: z.string(),
  minRedemptions: z.number(),
  unlocks: z.string(),
});

export type HuntLevel = z.infer<typeof levelSchema>;

export const winSchema = z.object({
  monthKey: z.string(),
  monthName: z.string(),
  year: z.number(),
  username: z.string(),
  perks: z.number(),
  voucherCode: z.string(),
  validUntil: z.string(),
  validUntilLabel: z.string(),
  givenAt: z.string().nullish(),
  prize: prizeSchema.nullable(),
});

export type MonthlyWin = z.infer<typeof winSchema>;

export const perkHunterSummarySchema = z.object({
  lifetimeRedemptions: z.number(),
  spots: z.number(),
  points: z.number(),
  level: levelSchema,
  next: levelSchema.nullable(),
  progress: z.number(),
  toGo: z.number(),
  levels: z.array(levelSchema),
  month: z.object({
    key: z.string(),
    name: z.string(),
    label: z.string(),
    year: z.number(),
    daysLeft: z.number(),
    endsAt: z.string(),
    rank: z.number().nullable(),
    perks: z.number(),
    toPodium: z.number().nullable(),
    prize: prizeSchema.nullable(),
  }),
  lastWin: winSchema.nullable(),
});

export type PerkHunterSummary = z.infer<typeof perkHunterSummarySchema>;

export const hunterSchema = z.object({
  userId: z.string(),
  rank: z.number(),
  username: z.string(),
  imageUrl: z.string().nullable(),
  perks: z.number(),
  isMe: z.boolean(),
});

export type Hunter = z.infer<typeof hunterSchema>;

export const boardSchema = z.object({
  monthKey: z.string(),
  monthLabel: z.string(),
  endsAt: z.string(),
  prize: prizeSchema.nullable(),
  hunters: z.array(hunterSchema),
});

export type PerkHunterBoard = z.infer<typeof boardSchema>;

export const hallSchema = z.object({
  winners: z.array(
    z.object({
      monthKey: z.string(),
      monthLabel: z.string(),
      username: z.string(),
      imageUrl: z.string().nullable(),
      perks: z.number(),
      prizeTitle: z.string().nullable(),
      isMe: z.boolean(),
    }),
  ),
});

export type HallOfFame = z.infer<typeof hallSchema>;
