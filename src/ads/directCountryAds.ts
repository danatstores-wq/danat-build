import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firestore';

export type DirectCountryAd = {
  id: string;
  countryCode: string;
  advertiserName: string;
  imageUrl: string;
  clickUrl: string;
  startsAt: Date;
  endsAt: Date;
  displayDurationSeconds: number;
};

export async function getActiveCountryAd(countryCode: string): Promise<DirectCountryAd | null> {
  const campaigns = await getDocs(query(
    collection(db, 'directAdCampaigns'),
    where('countryCode', '==', countryCode),
    where('active', '==', true),
  ));
  const now = Date.now();
  const eligible = campaigns.docs
    .map(item => {
      const data = item.data();
      return {
        id: item.id,
        countryCode: String(data.countryCode || ''),
        advertiserName: String(data.advertiserName || ''),
        imageUrl: String(data.imageUrl || ''),
        clickUrl: String(data.clickUrl || ''),
        startsAt: data.startsAt?.toDate?.() ?? new Date(data.startsAt),
        endsAt: data.endsAt?.toDate?.() ?? new Date(data.endsAt),
        displayDurationSeconds: Number.isFinite(Number(data.displayDurationSeconds)) ? Math.min(300, Math.max(1, Number(data.displayDurationSeconds))) : 6,
      } satisfies DirectCountryAd;
    })
    .filter(ad =>
      ad.countryCode === countryCode &&
      ad.advertiserName.length > 0 &&
      /^https:\/\//i.test(ad.imageUrl) &&
      /^https:\/\//i.test(ad.clickUrl) &&
      Number.isFinite(ad.startsAt.getTime()) &&
      Number.isFinite(ad.endsAt.getTime()) &&
      ad.startsAt.getTime() <= now &&
      ad.endsAt.getTime() >= now
    )
    .sort((a, b) => a.endsAt.getTime() - b.endsAt.getTime());
  return eligible[0] ?? null;
}
