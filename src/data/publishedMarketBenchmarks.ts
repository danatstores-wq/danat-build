import {
  CONSTRUCTION_MARKET_BENCHMARKS,
  ConstructionMarketBenchmarks,
} from './constructionMarketBenchmarks';

export type PublishedMarketBenchmarks = {
  version: string;
  publishedAt: string;
  countries: Record<'LB' | 'AE' | 'SA' | 'QA' | 'KW' | 'OM' | 'BH' | 'EG' | 'IQ', ConstructionMarketBenchmarks>;
};

// This file is replaced by the monthly Firebase-to-app publishing workflow.
// Runtime app screens import this static bundle; they never fetch benchmarks.
export const PUBLISHED_MARKET_BENCHMARKS: PublishedMarketBenchmarks = {
  version: '2026-11-11',
  publishedAt: '2026-11-11',
  countries: CONSTRUCTION_MARKET_BENCHMARKS,
};
