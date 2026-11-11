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
      { item: 'formwork carpenter', value: 206, unit: '9-hour day', status: 'market-survey', source: 'https://prices.qsmind.app/en/uae/labour', checkedAt: '2026-11-11', note: 'Dubai labor survey; do not treat as a per-m² installed rate.' },
      { item: 'plasterer', value: 164, unit: '8-hour day', status: 'market-survey', source: 'https://prices.qsmind.app/en/uae/labour', checkedAt: '2026-11-11', note: 'Dubai labor survey; supplier-provided accommodation/transport assumptions apply.' },
      { item: 'electrician', value: 208, unit: '8-hour day', status: 'market-survey', source: 'https://prices.qsmind.app/en/uae/labour', checkedAt: '2026-11-11' },
      { item: 'plumber', value: 190, unit: '8-hour day', status: 'market-survey', source: 'https://prices.qsmind.app/en/uae/labour', checkedAt: '2026-11-11' },
      { item: 'painter', value: 150, unit: '8-hour day', status: 'market-survey', source: 'https://prices.qsmind.app/en/uae/labour', checkedAt: '2026-11-11' },
      { item: 'footing excavation', value: 25, unit: 'm³ installed', status: 'market-survey', source: 'https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance', checkedAt: '2026-11-11', note: 'Dubai 2025 measured rate; large-project reference, excludes unrelated earthworks.' },
      { item: 'reinforcement', value: 5000, unit: 'tonne installed', status: 'market-survey', source: 'https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance', checkedAt: '2026-11-11', note: 'Dubai 2025 beam reinforcement measured rate; not steel supply price.' },
      { item: 'blockwork', value: 180, unit: 'm² installed', status: 'market-survey', source: 'https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance', checkedAt: '2026-11-11', note: 'Dubai 2025, 200 mm solid concrete block wall, bulk project.' },
      { item: 'ceramic floor tiles', value: 150, unit: 'm² installed', status: 'market-survey', source: 'https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance', checkedAt: '2026-11-11', note: 'Dubai 2025 standard ceramic tile, 1,000 m² project.' },
      { item: 'single solid-core door', value: 4000, unit: 'piece installed', status: 'market-survey', source: 'https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance', checkedAt: '2026-11-11', note: 'Dubai 2025 including frame and hardware; 50-door project.' },
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
      { item: 'mason', value: 16, unit: 'hour', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/labour', checkedAt: '2026-11-11', note: 'Riyadh labor benchmark; unit productivity is not implied.' },
      { item: 'steel fixer', value: 16, unit: 'hour', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/labour', checkedAt: '2026-11-11', note: 'Riyadh labor benchmark; unit productivity is not implied.' },
      { item: 'tile mason', value: 18, unit: 'hour', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/labour', checkedAt: '2026-11-11', note: 'Riyadh labor benchmark; unit productivity is not implied.' },
      { item: 'plaster mason', value: 15, unit: 'hour', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/labour', checkedAt: '2026-11-11', note: 'Riyadh labor benchmark; unit productivity is not implied.' },
      { item: 'plumber', value: 15, unit: 'hour', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/labour', checkedAt: '2026-11-11', note: 'Riyadh labor benchmark; unit productivity is not implied.' },
      { item: 'machine excavation', value: 21.5, unit: 'm³ installed', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/works', checkedAt: '2026-11-11', note: 'Riyadh normal soil, machine/operator/fuel included; rock and off-site disposal excluded.' },
      { item: 'internal cement plaster', value: 26, unit: 'm² installed', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/works', checkedAt: '2026-11-11', note: 'Riyadh supply and apply, approx. 2 cm, June 2026 observation.' },
      { item: 'porcelain floor tiling', value: 67.5, unit: 'm² installed', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/works', checkedAt: '2026-11-11', note: 'Riyadh mid-range 60x60 cm including adhesive, grout and skirting.' },
      { item: 'internal emulsion painting', value: 22, unit: 'm² installed', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/works', checkedAt: '2026-11-11', note: 'Riyadh mid-range putty, sealer and two coats.' },
      { item: 'roof waterproofing', value: 35, unit: 'm² installed', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/works', checkedAt: '2026-11-11', note: 'Riyadh 4 mm torch-applied membrane system.' },
      { item: 'gypsum board ceiling', value: 82.5, unit: 'm² installed', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/works', checkedAt: '2026-11-11', note: 'Riyadh 12.5 mm board and galvanized frame, ready for paint.' },
      { item: 'lighting point', value: 85, unit: 'point installed', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/works', checkedAt: '2026-11-11', note: 'Riyadh conduit and wiring, light fitting excluded.' },
      { item: 'socket outlet point', value: 97.5, unit: 'point installed', status: 'market-survey', source: 'https://prices.qsmind.app/en/saudi/works', checkedAt: '2026-11-11', note: 'Riyadh conduit, wiring and mid-range 13A outlet.' },
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
      { item: 'ordinary soil excavation', value: 28, unit: 'm³ installed', status: 'market-survey', source: 'https://www.carbonblueglobal.com/services/quantity-surveying', checkedAt: '2026-11-11', note: 'Illustrative Qatar BOQ sample rate; large measured quantity.' },
      { item: 'blinding concrete C15', value: 310, unit: 'm³ installed', status: 'market-survey', source: 'https://www.carbonblueglobal.com/services/quantity-surveying', checkedAt: '2026-11-11', note: 'Illustrative Qatar BOQ sample rate; specification-specific.' },
      { item: 'reinforced concrete C35 foundations', value: 395, unit: 'm³ installed', status: 'market-survey', source: 'https://www.carbonblueglobal.com/services/quantity-surveying', checkedAt: '2026-11-11', note: 'Illustrative Qatar BOQ sample rate; includes supply and installation.' },
      { item: 'hollow blockwork 200 mm', value: 62, unit: 'm² installed', status: 'market-survey', source: 'https://www.carbonblueglobal.com/services/quantity-surveying', checkedAt: '2026-11-11', note: 'Illustrative Qatar BOQ sample rate.' },
      { item: 'internal cement plaster', value: 34, unit: 'm² installed', status: 'market-survey', source: 'https://www.carbonblueglobal.com/services/quantity-surveying', checkedAt: '2026-11-11', note: 'Illustrative Qatar BOQ sample rate, 15 mm internal.' },
      { item: 'porcelain floor tiling', value: 145, unit: 'm² installed', status: 'market-survey', source: 'https://www.carbonblueglobal.com/services/quantity-surveying', checkedAt: '2026-11-11', note: 'Illustrative Qatar BOQ sample rate.' },
      { item: 'two-coat emulsion paint', value: 16, unit: 'm² installed', status: 'market-survey', source: 'https://www.carbonblueglobal.com/services/quantity-surveying', checkedAt: '2026-11-11', note: 'Illustrative Qatar BOQ sample rate.' },
    ],
  },
  KW: {
    currency: 'KWD',
    benchmarks: [
      { item: 'deformed rebar Y8-Y32', value: 245, unit: 'tonne', status: 'market-survey', source: 'https://www.gccpricing.com/kuwait-construction-prices', checkedAt: '2026-11-11', note: 'Indicative GCCPricing benchmark; verify grade, delivery and supplier quote.' },
      { item: 'cement', value: 3, unit: '50 kg bag', status: 'market-survey', source: 'https://www.gccpricing.com/kuwait-construction-prices', checkedAt: '2026-11-11', note: 'Indicative GCCPricing benchmark.' },
      { item: '17 cm limestone block', value: 0.431, unit: 'piece', status: 'published', source: 'https://online.nicbm.com/en/item/block-17', checkedAt: '2026-11-11', note: 'NIC Kuwait online retail listing, 390×190×190 mm; page states 12 pieces/m². Sandlime block, not a generic concrete-block rate.' },
      { item: '9 cm hollow cement block', value: 0.202, unit: 'piece', status: 'published', source: 'https://online.nicbm.com/en/item/hollow-blocks-39x19x09-cm-3-n-mm2', checkedAt: '2026-11-11', note: 'NIC Kuwait online retail listing, 390×190×90 mm; page states 25 pieces/m². Check stated coverage against actual laying pattern before BOQ conversion.' },
      { item: 'electrician basic wage', value: 185, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/kuwait', checkedAt: '2026-11-11', note: 'KWD 150-250 range; KWD 185 overseas-intake basic median. Housing/transport and employer costs are separate.' },
      { item: 'formwork carpenter basic wage', value: 180, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/kuwait', checkedAt: '2026-11-11', note: 'KWD 150-260 range; KWD 180 overseas-intake basic median. Not a contractor charge-out rate.' },
      { item: 'plumber basic wage', value: 170, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/kuwait', checkedAt: '2026-11-11', note: 'KWD 140-230 range; KWD 170 overseas-intake basic median. Not a contractor charge-out rate.' },
    ],
  },
  OM: {
    currency: 'OMR',
    benchmarks: [
      { item: '12 mm rebar', value: 248.5, unit: 'tonne', status: 'market-survey', source: 'https://madaar.om/', checkedAt: '2026-11-11', note: 'Indicative supplier gateway price; confirm stock and delivery.' },
      { item: '16 mm rebar', value: 246.1, unit: 'tonne', status: 'market-survey', source: 'https://madaar.om/', checkedAt: '2026-11-11', note: 'Indicative supplier gateway price; confirm stock and delivery.' },
      { item: 'Raysut cement (Al Wusta field survey)', value: 1.6, unit: '50 kg bag', status: 'published', source: 'https://shabiba.com/article/212280-%D9%84%D9%84%D9%85%D9%82%D8%A8%D9%84%D9%8A%D9%86-%D8%A8%D8%A7%D9%84%D8%A8%D9%86%D8%A7-%D8%A8%D8%A7%D9%84%D9%88%D8%B3%D8%B7%D9%89-%D9%83%D9%85-%D8%A8%D9%84%D8%BA%D8%AA-%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D8%A7%D9%84%D8%A3%D8%B3%D9%85%D9%86%D8%AA-%D9%88%D8%A7%D9%84%D8%AD%D8%AF%D9%8A%D8%AF-%D9%81%D9%8A-%D9%85%D9%86%D8%A7%D9%81%D8%B0-%D8%A7%D9%84%D8%A8%D9%8A%D8%B9', checkedAt: '2026-11-11', note: 'Indicative midpoint of OMR 1.45–1.75 observed across named brands in Al Wusta on 8 Oct 2026; regional supplier survey, not a national average.' },
      { item: 'OPC/SRC cement (GCCPricing index)', value: 3, unit: '50 kg bag', status: 'market-survey', source: 'https://www.gccpricing.com/oman-construction-prices', checkedAt: '2026-11-11', note: 'Separate portal benchmark; differs materially from the October Al Wusta field observations and needs supplier verification.' },
      { item: 'ready-mix concrete C25-C40', value: 24, unit: 'm³', status: 'market-survey', source: 'https://binaasouq.com/', checkedAt: '2026-11-11', note: 'Lower end of listed OMR 24-38/m³ range; mix grade and delivery change price.' },
      { item: 'hollow block', value: 0.22, unit: 'piece', status: 'market-survey', source: 'https://binaasouq.com/', checkedAt: '2026-11-11', note: 'Lower end of listed OMR 0.22-0.38 per block range.' },
      { item: 'regular 20 cm hollow block', value: 0.17, unit: 'piece', status: 'published', source: 'https://www.mcp.om/en/cement-blocks', checkedAt: '2026-11-11', note: 'Omani manufacturer published OMR 0.165-0.175 per piece; delivery area changes price.' },
      { item: '20 cm solid block', value: 0.215, unit: 'piece', status: 'published', source: 'https://www.mcp.om/en/cement-blocks', checkedAt: '2026-11-11', note: 'Omani manufacturer published OMR 0.210-0.220 per piece; delivery area changes price.' },
      { item: 'electrician basic wage', value: 210, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/oman', checkedAt: '2026-11-11', note: 'OMR 180-280 range; OMR 210 overseas-intake basic median. Housing/transport and employer costs are separate.' },
      { item: 'plumber basic wage', value: 190, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/oman', checkedAt: '2026-11-11', note: 'OMR 160-260 range; OMR 190 overseas-intake basic median. Not a contractor charge-out rate.' },
      { item: 'formwork carpenter basic wage', value: 190, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/oman', checkedAt: '2026-11-11', note: 'OMR 160-270 range; OMR 190 overseas-intake basic median. Not a contractor charge-out rate.' },
    ],
  },
};

// Directly mappable local material/service observations. Values are in the
// selected market currency and the corresponding COST_ITEMS unit. They are
// intentionally sparse: unsupported items remain zero and are flagged by the
// calculator rather than being filled with Lebanon rates or an FX multiplier.
export const COUNTRY_ITEM_RATE_DEFAULTS: Partial<
  Record<'AE' | 'SA' | 'QA' | 'KW' | 'OM', Record<string, { material: number; labor: number }>>
> = {
  AE: {
    excavation: { material: 25, labor: 0 }, // T&T 2025 measured excavation service, AED/m³
    footingConcrete: { material: 300, labor: 13.13 }, // 0.75 skilled-trade hours/m³ × AED17.50/hr
    columnConcrete: { material: 300, labor: 13.13 },
    stairConcrete: { material: 300, labor: 13.13 },
    beamConcrete: { material: 300, labor: 13.13 },
    slabConcrete: { material: 300, labor: 13.13 },
    foundationSteel: { material: 2.9, labor: 1.4 }, // 0.08 skilled-trade hours/kg × AED17.50/hr
    structuralSteel: { material: 2.9, labor: 1.4 },
    foundationFormwork: { material: 0, labor: 11.44 }, // 0.5 carpenter hours/m² × AED206/9h
    columnFormwork: { material: 0, labor: 11.44 },
    beamFormwork: { material: 0, labor: 11.44 },
    slabFormwork: { material: 0, labor: 11.44 },
    externalBlocks: { material: 0, labor: 11.38 }, // 0.65 skilled-trade hours/m² × AED17.50/hr
    internalBlocks: { material: 40.63, labor: 0 }, // T&T 100 mm solid block AED3.25 each × 12.5 blocks/m²
    cementMasonry: { material: 13.13, labor: 0 }, // Quanto UAE cement, AED/50 kg bag
    internalPlaster: { material: 0, labor: 6.15 }, // 0.3 plasterer hours/m² × AED164/8h
    externalPlaster: { material: 0, labor: 6.15 },
    ceilingPlaster: { material: 0, labor: 6.15 },
    lightingPoints: { material: 0, labor: 31.2 }, // 1.2 electrician hours/point × AED208/8h
    singleSockets: { material: 0, labor: 31.2 },
    doubleSockets: { material: 0, labor: 31.2 },
    acPoints: { material: 0, labor: 31.2 },
    waterHeaterPoints: { material: 0, labor: 31.2 },
    tvPoints: { material: 0, labor: 31.2 },
    internetPoints: { material: 0, labor: 31.2 },
    switchPoints: { material: 0, labor: 31.2 },
    coldWaterPoints: { material: 0, labor: 35.63 }, // 1.5 plumber hours/point × AED190/8h
    hotWaterPoints: { material: 0, labor: 35.63 },
    toiletConnections: { material: 0, labor: 35.63 },
    showerConnections: { material: 0, labor: 35.63 },
    basinConnections: { material: 0, labor: 35.63 },
    kitchenConnections: { material: 0, labor: 35.63 },
    floorTiles: { material: 0, labor: 7.88 }, // 0.45 skilled-trade hours/m² × AED17.50/hr
    falseCeiling: { material: 20, labor: 7.88 }, // T&T plasterboard material; frame excluded
    wallPrimer: { material: 0, labor: 2.25 }, // 0.12 painter hours/m² × AED150/8h
    wallPutty: { material: 0, labor: 2.25 },
    interiorPaint: { material: 0, labor: 2.25 },
    exteriorPaint: { material: 0, labor: 2.25 },
  },
  SA: {
    excavation: { material: 21.5, labor: 0 }, // QS Mind machine excavation, SAR/m³ installed
    footingConcrete: { material: 212.52, labor: 25.52 }, // 0.75 concrete-worker hours/m³ × SAR34.03/hr
    columnConcrete: { material: 212.52, labor: 25.52 },
    stairConcrete: { material: 212.52, labor: 25.52 },
    beamConcrete: { material: 212.52, labor: 25.52 },
    slabConcrete: { material: 212.52, labor: 25.52 },
    foundationSteel: { material: 3.12285, labor: 1.28 }, // 0.08 steel-fixer hours/kg × SAR16/hr
    structuralSteel: { material: 3.12285, labor: 1.28 },
    externalBlocks: { material: 20.97, labor: 10.4 }, // GASTAT 15 cm block × 12.5 blocks/m²; 0.65 mason hours
    cementMasonry: { material: 15.53, labor: 0 }, // GASTAT black cement, SAR/50 kg bag
    sandMasonry: { material: 77.61, labor: 0 }, // GASTAT soft sand, SAR/m³
    internalPlaster: { material: 0, labor: 4.5 }, // 0.3 plaster-mason hours/m² × SAR15/hr
    externalPlaster: { material: 0, labor: 4.5 },
    ceilingPlaster: { material: 0, labor: 4.5 },
    floorTiles: { material: 23.16, labor: 8.1 }, // GASTAT marble material + 0.45 tile-mason hours/m²
    coldWaterPoints: { material: 0, labor: 22.5 }, // 1.5 plumber hours/point × SAR15/hr
    hotWaterPoints: { material: 0, labor: 22.5 },
    toiletConnections: { material: 0, labor: 22.5 },
    showerConnections: { material: 0, labor: 22.5 },
    basinConnections: { material: 0, labor: 22.5 },
    kitchenConnections: { material: 0, labor: 22.5 },
  },
  QA: {
    excavation: { material: 28, labor: 0 }, // Qatar sample BOQ machine excavation service, QAR/m³
    footingConcrete: { material: 305, labor: 28.07 }, // 0.75 concrete-worker hours/m³ × QAR37.42/hr
    columnConcrete: { material: 305, labor: 28.07 },
    stairConcrete: { material: 305, labor: 28.07 },
    beamConcrete: { material: 305, labor: 28.07 },
    slabConcrete: { material: 305, labor: 28.07 },
    foundationSteel: { material: 2.99, labor: 0 }, // Ashghal 10–40 mm rebar, QAR/kg
    structuralSteel: { material: 2.99, labor: 0 },
    foundationFormwork: { material: 0, labor: 22.22 }, // 0.5 carpenter hours/m² × QAR44.43/hr
    columnFormwork: { material: 0, labor: 22.22 },
    beamFormwork: { material: 0, labor: 22.22 },
    slabFormwork: { material: 0, labor: 22.22 },
    externalBlocks: { material: 0, labor: 27.36 }, // 0.65 mason hours/m² × QAR42.09/hr
    cementMasonry: { material: 34, labor: 0 }, // QAR17/25 kg converted to 50 kg bag
    sandMasonry: { material: 72, labor: 0 }, // BoqCalc sand QAR/m³
    internalPlaster: { material: 0, labor: 12.63 }, // 0.3 skilled mason hours/m² × QAR42.09/hr
    externalPlaster: { material: 0, labor: 12.63 },
    ceilingPlaster: { material: 0, labor: 12.63 },
    lightingPoints: { material: 0, labor: 56.12 }, // 1.2 electrician hours/point × QAR46.77/hr
    singleSockets: { material: 0, labor: 56.12 },
    doubleSockets: { material: 0, labor: 56.12 },
    acPoints: { material: 0, labor: 56.12 },
    waterHeaterPoints: { material: 0, labor: 56.12 },
    tvPoints: { material: 0, labor: 56.12 },
    internetPoints: { material: 0, labor: 56.12 },
    switchPoints: { material: 0, labor: 56.12 },
    coldWaterPoints: { material: 0, labor: 70.16 }, // 1.5 plumber hours/point × QAR46.77/hr
    hotWaterPoints: { material: 0, labor: 70.16 },
    toiletConnections: { material: 0, labor: 70.16 },
    showerConnections: { material: 0, labor: 70.16 },
    basinConnections: { material: 0, labor: 70.16 },
    kitchenConnections: { material: 0, labor: 70.16 },
    floorTiles: { material: 0, labor: 18.94 }, // 0.45 tiler hours/m² × QAR42.09/hr
    falseCeiling: { material: 23, labor: 17.89 }, // QAR23/m² board + 0.45 installer hours
    wallPrimer: { material: 0, labor: 4.21 }, // 0.12 painter hours/m² × QAR35.08/hr
    wallPutty: { material: 0, labor: 4.21 },
    interiorPaint: { material: 0, labor: 4.21 },
    exteriorPaint: { material: 0, labor: 4.21 },
  },
  KW: {
    foundationSteel: { material: 0.245, labor: 0 }, // GCCPricing KWD245/t converted to kg
    structuralSteel: { material: 0.245, labor: 0 },
    cementMasonry: { material: 3, labor: 0 }, // GCCPricing KWD/50 kg bag
  },
  OM: {
    footingConcrete: { material: 24, labor: 0 }, // BinaaSouq lower bound C25–C40 ready-mix, OMR/m³
    columnConcrete: { material: 24, labor: 0 },
    stairConcrete: { material: 24, labor: 0 },
    beamConcrete: { material: 24, labor: 0 },
    slabConcrete: { material: 24, labor: 0 },
    foundationSteel: { material: 0.307, labor: 0 }, // GCCPricing OMR307/t converted to kg
    structuralSteel: { material: 0.307, labor: 0 },
    externalBlocks: { material: 2.13, labor: 0 }, // MCP 20 cm hollow block OMR0.17 each × 12.5 blocks/m²
    cementMasonry: { material: 1.6, labor: 0 }, // Al Wusta Oct 2026 field-survey midpoint, OMR/50 kg bag; regional provisional anchor
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
