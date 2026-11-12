import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firestore';
import {
  CONSTRUCTION_MARKET_BENCHMARKS,
  ConstructionMarketBenchmarks,
} from './constructionMarketBenchmarks';

export type BenchmarkCountryCode = 'LB' | 'AE' | 'SA' | 'QA' | 'KW' | 'OM' | 'BH' | 'EG' | 'IQ';
export type BenchmarkCountryMap = Record<BenchmarkCountryCode, ConstructionMarketBenchmarks>;

export type PublishedMarketBenchmarks = {
  version: string;
  publishedAt: string;
  countries: BenchmarkCountryMap;
  source: 'firestore' | 'local-fallback';
};

export async function getPublishedMarketBenchmarks(): Promise<PublishedMarketBenchmarks> {
  try {
    const snapshot = await getDoc(doc(db, 'constructionMarketBenchmarks', 'current'));
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (
        typeof data.version === 'string' &&
        typeof data.publishedAt === 'string' &&
        data.countries &&
        typeof data.countries === 'object'
      ) {
        return {
          version: data.version,
          publishedAt: data.publishedAt,
          countries: data.countries as BenchmarkCountryMap,
          source: 'firestore',
        };
      }
    }
  } catch (error) {
    console.warn('Could not load published construction benchmarks; using bundled rates.', error);
  }

  return {
    version: 'bundled-2026-11-11',
    publishedAt: '2026-11-11',
    countries: CONSTRUCTION_MARKET_BENCHMARKS,
    source: 'local-fallback',
  };
}
