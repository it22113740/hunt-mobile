import { z } from 'zod';

export const venueSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  description: z.string().nullish(),
  category: z.string().nullish(),
  imageUrl: z.string().nullish(),
  instagramUrl: z.string().nullish(),
  facebookUrl: z.string().nullish(),
  tiktokUrl: z.string().nullish(),
  pointsPerPhoto: z.number(),
  pointsPerVideo: z.number(),
  lat: z.number(),
  lng: z.number(),
  distance: z.number().optional(),
  offerPercent: z.number().nullish(),
});

export const venueListSchema = z.array(venueSchema);

export type Venue = z.infer<typeof venueSchema>;

export const perkSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  pointsRequired: z.number(),
  type: z.enum(['DISCOUNT', 'FREE_MEAL', 'OTHER']),
  discountPercent: z.number().nullish(),
  imageUrl: z.string().nullish(),
});

export const perkListSchema = z.array(perkSchema);

export type Perk = z.infer<typeof perkSchema>;

export const promotionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  imageUrl: z.string().nullish(),
  startsAt: z.string(),
  endsAt: z.string(),
  discountPercent: z.number().nullish(),
});

export const promotionListSchema = z.array(promotionSchema);

export type Promotion = z.infer<typeof promotionSchema>;

export const promotionFeedItemSchema = promotionSchema.extend({
  venue: z.object({
    id: z.string(),
    name: z.string(),
    category: z.string().nullish(),
  }),
});

export const promotionFeedSchema = z.array(promotionFeedItemSchema);

export type PromotionFeedItem = z.infer<typeof promotionFeedItemSchema>;

export const galleryItemSchema = z.object({
  id: z.string(),
  mediaUrl: z.string(),
  type: z.enum(['PHOTO', 'VIDEO']),
  createdAt: z.string(),
});

export const gallerySchema = z.array(galleryItemSchema);

export type GalleryItem = z.infer<typeof galleryItemSchema>;

export const perkShotSchema = z.object({
  id: z.string(),
  mediaUrl: z.string(),
  createdAt: z.string(),
  perkId: z.string(),
  perkTitle: z.string(),
  username: z.string(),
});

export type PerkShot = z.infer<typeof perkShotSchema>;

export const redeemedBoardSchema = z.object({
  venueName: z.string(),
  sinceLabel: z.string(),
  people: z.number(),
  perks: z.number(),
  photos: z.number(),
  videos: z.number(),
  shots: z.number().default(0),
  thisWeek: z.number(),
  cameBack: z.number(),
  regulars: z.number(),
  topPerk: z.string().nullable(),
  preview: z.array(perkShotSchema),
  filters: z.array(z.object({ id: z.string(), title: z.string() })),
});

export type RedeemedBoard = z.infer<typeof redeemedBoardSchema>;

export const perkShotPageSchema = z.object({
  items: z.array(perkShotSchema),
  nextCursor: z.string().nullable(),
});

export const savedPerkShotSchema = z.object({
  id: z.string(),
  redemptionId: z.string(),
  venueId: z.string(),
  mediaUrl: z.string(),
});

/** Great-circle distance in metres. */
export function distanceMeters(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371e3 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
