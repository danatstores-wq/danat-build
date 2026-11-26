import AsyncStorage from '@react-native-async-storage/async-storage';
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

const lastShownKey = (countryCode: string) => `directCountryAds:lastShown:${countryCode}`;

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
    // Keep the order stable so every device advances through the same campaign list.
    .sort((a, b) => a.advertiserName.localeCompare(b.advertiserName) || a.id.localeCompare(b.id));

  if (eligible.length === 0) return null;

  // Round-robin rotation is stored locally per device and country.
  // This avoids extra Firestore writes and keeps advertiser selection independent by country.
  let lastShownId: string | null = null;
  try {
    lastShownId = await AsyncStorage.getItem(lastShownKey(countryCode));
  } catch (error) {
    console.warn('Could not read the last country ad rotation position:', error);
  }

  const lastIndex = eligible.findIndex(ad => ad.id === lastShownId);
  const nextIndex = lastIndex < 0 ? 0 : (lastIndex + 1) % eligible.length;
  const selectedAd = eligible[nextIndex];

  try {
    await AsyncStorage.setItem(lastShownKey(countryCode), selectedAd.id);
  } catch (error) {
    console.warn('Could not save the country ad rotation position:', error);
  }

  return selectedAd;
}
