/**
 * Country-specific construction market benchmarks reviewed 11 November 2026.
 *
 * These are source-backed market anchors, not a complete bill-of-quantities rate
 * card. Keep the original units and tax/delivery qualifications: do not silently
 * convert a benchmark into a different specification or an installed rate.
 * Provisional item rates must be recorded separately from these observations.
 */

export type MarketBenchmark = {
  item: string;
  value: number;
  unit: string;
  status: 'published' | 'market-survey';
  source: string;
  checkedAt: '2026-11-11';
  note?: string;
};

export type ConstructionMarketBenchmarks = {
  currency: string;
  benchmarks: MarketBenchmark[];
};

export const CONSTRUCTION_MARKET_BENCHMARKS: Record<
  'AE' | 'SA' | 'QA' | 'KW' | 'OM',
  ConstructionMarketBenchmarks
> = {
  AE: {
    currency: 'AED',
    benchmarks: [
      { item: 'cement', value: 13.13, unit: '50 kg bag', status: 'published', source: 'https://quantohq.com/price-index.html', checkedAt: '2026-11-11', note: 'Dubai indicative index, October 2026, excluding VAT.' },
      { item: 'rebar', value: 2936, unit: 'tonne', status: 'published', source: 'https://quantohq.com/price-index.html', checkedAt: '2026-11-11', note: 'Emirates Steel delivered-to-Dubai indicative benchmark; ex-works and retail quotes differ.' },
      { item: 'C40 ready-mix concrete', value: 261, unit: 'm³', status: 'published', source: 'https://quantohq.com/price-index.html', checkedAt: '2026-11-11', note: 'Dubai indicative index, excluding VAT.' },
      { item: 'formwork carpenter', value: 206, unit: '9-hour day', status: 'market-survey', source: 'https://qsmind.com/', checkedAt: '2026-11-11', note: 'Dubai labor survey; do not treat as a per-m² installed rate.' },
      { item: 'plasterer', value: 164, unit: '8-hour day', status: 'market-survey', source: 'https://qsmind.com/', checkedAt: '2026-11-11', note: 'Dubai labor survey; supplier-provided accommodation/transport assumptions apply.' },
      { item: 'electrician', value: 208, unit: '8-hour day', status: 'market-survey', source: 'https://qsmind.com/', checkedAt: '2026-11-11' },
      { item: 'plumber', value: 190, unit: '8-hour day', status: 'market-survey', source: 'https://qsmind.com/', checkedAt: '2026-11-11' },
      { item: 'painter', value: 150, unit: '8-hour day', status: 'market-survey', source: 'https://qsmind.com/', checkedAt: '2026-11-11' },
    ],
  },
  SA: {
    currency: 'SAR',
    benchmarks: [
      { item: 'black cement', value: 15.53, unit: '50 kg bag', status: 'published', source: 'https://ibuild.sa/material-prices', checkedAt: '2026-11-11', note: 'GASTAT September 2026 national average; VAT included.' },
      { item: '12 mm rebar', value: 3122.85, unit: 'tonne', status: 'published', source: 'https://ibuild.sa/material-prices', checkedAt: '2026-11-11', note: 'GASTAT September 2026 national average.' },
      { item: '350K normal ready-mix concrete', value: 212.52, unit: 'm³', status: 'published', source: 'https://ibuild.sa/material-prices', checkedAt: '2026-11-11', note: 'GASTAT September 2026 national average.' },
      { item: '15 cm block', value: 1.67778, unit: 'piece', status: 'published', source: 'https://ibuild.sa/material-prices', checkedAt: '2026-11-11', note: 'Converted from SAR 1,677.78 per 1,000 pieces.' },
      { item: 'white soft sand', value: 77.61, unit: 'm³', status: 'published', source: 'https://ibuild.sa/material-prices', checkedAt: '2026-11-11', note: 'GASTAT September 2026 national average.' },
      { item: 'mason', value: 16, unit: 'hour', status: 'market-survey', source: 'https://qsmind.com/', checkedAt: '2026-11-11', note: 'Riyadh labor benchmark; unit productivity is not implied.' },
      { item: 'steel fixer', value: 16, unit: 'hour', status: 'market-survey', source: 'https://qsmind.com/', checkedAt: '2026-11-11', note: 'Riyadh labor benchmark; unit productivity is not implied.' },
      { item: 'tile mason', value: 18, unit: 'hour', status: 'market-survey', source: 'https://qsmind.com/', checkedAt: '2026-11-11', note: 'Riyadh labor benchmark; unit productivity is not implied.' },
      { item: 'plaster mason', value: 15, unit: 'hour', status: 'market-survey', source: 'https://qsmind.com/', checkedAt: '2026-11-11', note: 'Riyadh labor benchmark; unit productivity is not implied.' },
      { item: 'plumber', value: 15, unit: 'hour', status: 'market-survey', source: 'https://qsmind.com/', checkedAt: '2026-11-11', note: 'Riyadh labor benchmark; unit productivity is not implied.' },
    ],
  },
  QA: {
    currency: 'QAR',
    benchmarks: [
      { item: 'crushed stone 0-32 mm', value: 62, unit: 'm³', status: 'market-survey', source: 'https://boqcalc.com/countries/qatar', checkedAt: '2026-11-11', note: 'Commercial market estimate, not an official schedule.' },
      { item: 'sand 0-4 mm', value: 72, unit: 'm³', status: 'market-survey', source: 'https://boqcalc.com/countries/qatar', checkedAt: '2026-11-11', note: 'Commercial market estimate, not an official schedule.' },
      { item: 'C25/30 ready-mix concrete', value: 270, unit: 'm³', status: 'market-survey', source: 'https://boqcalc.com/countries/qatar', checkedAt: '2026-11-11', note: 'Commercial market estimate; delivery/pumping must be checked separately.' },
      { item: 'cement', value: 17, unit: '25 kg bag', status: 'market-survey', source: 'https://boqcalc.com/countries/qatar', checkedAt: '2026-11-11', note: 'Commercial market estimate.' },
      { item: 'concrete worker', value: 37.42, unit: 'hour', status: 'market-survey', source: 'https://boqcalc.com/countries/qatar', checkedAt: '2026-11-11', note: 'Hourly labor benchmark; do not treat as a per-unit installed rate.' },
      { item: 'electrician', value: 46.77, unit: 'hour', status: 'market-survey', source: 'https://boqcalc.com/countries/qatar', checkedAt: '2026-11-11', note: 'Hourly labor benchmark; do not treat as a per-point installed rate.' },
      { item: 'plumber', value: 46.77, unit: 'hour', status: 'market-survey', source: 'https://boqcalc.com/countries/qatar', checkedAt: '2026-11-11', note: 'Hourly labor benchmark; do not treat as a per-point installed rate.' },
      { item: 'tiler', value: 42.09, unit: 'hour', status: 'market-survey', source: 'https://boqcalc.com/countries/qatar', checkedAt: '2026-11-11', note: 'Hourly labor benchmark; do not treat as a per-m² installed rate.' },
    ],
  },
  KW: {
    currency: 'KWD',
    benchmarks: [
      { item: 'deformed rebar Y8-Y32', value: 245, unit: 'tonne', status: 'market-survey', source: 'https://gccpricing.com/', checkedAt: '2026-11-11', note: 'Indicative GCCPricing benchmark; verify grade, delivery and supplier quote.' },
      { item: 'cement', value: 3, unit: '50 kg bag', status: 'market-survey', source: 'https://gccpricing.com/', checkedAt: '2026-11-11', note: 'Indicative GCCPricing benchmark.' },
    ],
  },
  OM: {
    currency: 'OMR',
    benchmarks: [
      { item: '12 mm rebar', value: 248.5, unit: 'tonne', status: 'market-survey', source: 'https://madaar.om/', checkedAt: '2026-11-11', note: 'Indicative supplier gateway price; confirm stock and delivery.' },
      { item: '16 mm rebar', value: 246.1, unit: 'tonne', status: 'market-survey', source: 'https://madaar.om/', checkedAt: '2026-11-11', note: 'Indicative supplier gateway price; confirm stock and delivery.' },
      { item: 'cement', value: 3, unit: '50 kg bag', status: 'market-survey', source: 'https://gccpricing.com/', checkedAt: '2026-11-11', note: 'Indicative GCCPricing benchmark; verify brand and delivery.' },
      { item: 'ready-mix concrete C25-C40', value: 24, unit: 'm³', status: 'market-survey', source: 'https://binaasouq.com/', checkedAt: '2026-11-11', note: 'Lower end of listed OMR 24-38/m³ range; mix grade and delivery change price.' },
      { item: 'hollow block', value: 0.22, unit: 'piece', status: 'market-survey', source: 'https://binaasouq.com/', checkedAt: '2026-11-11', note: 'Lower end of listed OMR 0.22-0.38 per block range.' },
    ],
  },
};

export const MARKET_RATE_LABELS = {
  published: {
    en: 'Published market benchmark',
    ar: 'سعر سوق منشور',
    fr: 'Référence de marché publiée',
  },
  'market-survey': {
    en: 'Market survey benchmark',
    ar: 'مرجع مسح السوق',
    fr: 'Référence issue d’une enquête de marché',
  },
  provisional: {
    en: 'Provisional planning estimate',
    ar: 'تقدير تخطيطي أولي',
    fr: 'Estimation provisoire de planification',
  },
} as const;
