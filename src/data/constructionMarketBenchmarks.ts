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
  'LB' | 'AE' | 'SA' | 'QA' | 'KW' | 'OM' | 'BH',
  ConstructionMarketBenchmarks
> = {
  LB: {
    currency: 'USD',
    // Lebanon market observations. Keep factory-gate, retail and shortage-market
    // prices distinct; they are not interchangeable or a national average.
    benchmarks: [
      { item: 'black cement factory-gate ceiling', value: 96, unit: 'tonne', status: 'published', source: 'https://www.mtv.com.lb/news/محليات/1712965/عيسى-الخوري-يحدّد-سعر-طن-الاسمنت-الأسود', checkedAt: '2026-11-11', note: 'Ministry of Industry Decision 52/1, 1 July 2026; factory-gate maximum, excluding VAT. Not a delivered retail price.' },
      { item: 'Portland cement CEM I 42.5N', value: 8.5, unit: '50 kg bag', status: 'published', source: 'https://ayass-boutique.store/en/product/portland-cement-50kg', checkedAt: '2026-11-11', note: 'Beirut retailer online listing; stock could not be independently reconfirmed on 11 November 2026. Supply-only; confirm current stock, delivery and checkout price.' },
      { item: '12 mm reinforcement steel', value: 970, unit: 'tonne', status: 'market-survey', source: 'https://lebanoneconomy.net/الترميم-يواجه-تحدّي-ضبط-الأسعار/', checkedAt: '2026-11-11', note: 'Lebanon market report, 2026; reported market level around USD 970/tonne. Verify grade, delivery and current supplier quotation.' },
      { item: 'general construction worker wage', value: 50, unit: 'day', status: 'market-survey', source: 'https://lebanoneconomy.net/الترميم-يواجه-تحدّي-ضبط-الأسعار/', checkedAt: '2026-11-11', note: 'Lebanon market report, 2026; reported daily labour cost from USD 50. Not a skilled-trade wage schedule or contractor charge-out rate.' },
      { item: 'building stone', value: 65, unit: '100 pieces', status: 'market-survey', source: 'https://lebanoneconomy.net/الترميم-يواجه-تحدّي-ضبط-الأسعار/', checkedAt: '2026-11-11', note: 'Midpoint of reported USD 60–70 per 100 stones; size, quarry and delivery affect price.' },
      { item: 'porcelain floor tile 60x60', value: 18.5, unit: 'm²', status: 'published', source: 'https://ayass-boutique.store/en/product/porcelain-floor-tile-60x60', checkedAt: '2026-11-11', note: 'Beirut retailer online listing; 600×600 mm, 9 mm, R10 matt porcelain; material only, installation excluded. Stock could not be independently reconfirmed on 11 November 2026; confirm stock, delivery and checkout price.' },
      { item: 'ceramic wall tile 30x60', value: 11, unit: 'm²', status: 'published', source: 'https://ayass-boutique.store/en/product/ceramic-wall-tile-30x60', checkedAt: '2026-11-11', note: 'Beirut retailer online listing; 300×600 mm glazed wall tile; material only, installation excluded. Stock could not be independently reconfirmed on 11 November 2026; confirm stock, delivery and checkout price.' },
      { item: 'tile adhesive C2TE 25kg', value: 13, unit: '25 kg bag', status: 'published', source: 'https://ayass-boutique.store/en', checkedAt: '2026-11-11', note: 'Beirut retailer online listing; one 25 kg bag; coverage depends on trowel size and substrate. Stock could not be independently reconfirmed on 11 November 2026; confirm stock, delivery and checkout price.' },
      { item: 'white cement', value: 16, unit: '50 kg bag', status: 'published', source: 'https://ayass-boutique.store/en/product/white-cement-50kg', checkedAt: '2026-11-11', note: 'Beirut retailer online listing; white cement for decorative/rendering use, not interchangeable with black structural cement. Stock could not be independently reconfirmed on 11 November 2026; confirm stock, delivery and checkout price.' },
    ],
  },
  AE: {
    currency: 'AED',
    benchmarks: [
      { item: 'cement', value: 13.13, unit: '50 kg bag', status: 'published', source: 'https://quantohq.com/price-index.html', checkedAt: '2026-11-11', note: 'Dubai indicative index, October 2026, excluding VAT.' },
      { item: 'rebar', value: 2936, unit: 'tonne', status: 'published', source: 'https://quantohq.com/price-index.html', checkedAt: '2026-11-11', note: 'Emirates Steel delivered-to-Dubai indicative benchmark; ex-works and retail quotes differ.' },
      { item: 'C40 ready-mix concrete', value: 261, unit: 'm³', status: 'published', source: 'https://quantohq.com/price-index.html', checkedAt: '2026-11-11', note: 'Dubai indicative index, excluding VAT.' },
      { item: 'formwork carpenter', value: 206, unit: '9-hour day', status: 'market-survey', source: 'https://prices.qsmind.app/en/uae/labour', checkedAt: '2026-11-11', note: 'Dubai labor survey; do not treat as a per-m² installed rate.' },
      { item: 'plasterer', value: 164, unit: '8-hour day', status: 'market-survey', source: 'https://prices.qsmind.app/en/uae/labour', checkedAt: '2026-11-11', note: 'Dubai labor survey; supplier-provided accommodation/transport assumptions apply.' },
      { item: 'electrician', value: 208, unit: '8-hour day', status: 'market-survey', source: 'https://prices.qsmind.app/en/uae/labour', checkedAt: '2026-11-11' },
      { item: 'plumber', value: 208, unit: '8-hour day', status: 'market-survey', source: 'https://prices.qsmind.app/en/uae/labour', checkedAt: '2026-11-11', note: 'Dubai labour survey; AED 208 per 8-hour working day.' },
      { item: 'painter', value: 190, unit: '8-hour day', status: 'market-survey', source: 'https://prices.qsmind.app/en/uae/labour', checkedAt: '2026-11-11', note: 'Dubai labour survey; AED 190 per 8-hour working day.' },
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
      { item: 'ready-mix concrete C30/37', value: 24.85, unit: 'm³', status: 'market-survey', source: 'https://www.gccpricing.com/materials/ready-mix-concrete-c30-price-kuwait', checkedAt: '2026-11-11', note: 'Delivered KWD 24.85/m³ reference-parity benchmark updated 26 Oct 2026; GCCPricing labels Kuwait as calibrated parity rather than a direct local merchant submission.' },
      { item: 'CMU hollow block 200 mm', value: 0.59, unit: 'piece', status: 'market-survey', source: 'https://www.gccpricing.com/materials/cmu-hollow-block-200mm-price-kuwait', checkedAt: '2026-11-11', note: 'Local-origin 400×200×200 mm hollow CMU, supply-only; updated 5 days ago. 12.5 pieces/m² before waste; verify local supplier quote.' },
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
      { item: 'ready-mix concrete C30/37', value: 31.15, unit: 'm³', status: 'market-survey', source: 'https://www.gccpricing.com/materials/ready-mix-concrete-c30-price-kuwait', checkedAt: '2026-11-11', note: 'Delivered OMR 31.15/m³ GCCPricing reference-parity benchmark updated 26 Oct 2026; not a direct local merchant submission. Retains BinaaSouq OMR 24–38/m³ range as an independent local supplier cross-check.' },
      { item: 'CMU hollow block 200 mm', value: 0.74, unit: 'piece', status: 'market-survey', source: 'https://www.gccpricing.com/materials/cmu-hollow-block-200mm-price-kuwait', checkedAt: '2026-11-11', note: 'Local-origin 400×200×200 mm hollow CMU, supply-only; updated 5 days ago. Materially higher than Al Madina manufacturer OMR 0.165–0.175 listing, so not used as the starter block rate pending supplier reconciliation.' },
      { item: 'hollow block', value: 0.22, unit: 'piece', status: 'market-survey', source: 'https://binaasouq.com/', checkedAt: '2026-11-11', note: 'Lower end of listed OMR 0.22-0.38 per block range.' },
      { item: 'regular 20 cm hollow block', value: 0.17, unit: 'piece', status: 'published', source: 'https://www.mcp.om/en/cement-blocks', checkedAt: '2026-11-11', note: 'Omani manufacturer published OMR 0.165-0.175 per piece; delivery area changes price.' },
      { item: '20 cm solid block', value: 0.215, unit: 'piece', status: 'published', source: 'https://www.mcp.om/en/cement-blocks', checkedAt: '2026-11-11', note: 'Omani manufacturer published OMR 0.210-0.220 per piece; delivery area changes price.' },
      { item: 'electrician basic wage', value: 210, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/oman', checkedAt: '2026-11-11', note: 'OMR 180-280 range; OMR 210 overseas-intake basic median. Housing/transport and employer costs are separate.' },
      { item: 'plumber basic wage', value: 190, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/oman', checkedAt: '2026-11-11', note: 'OMR 160-260 range; OMR 190 overseas-intake basic median. Not a contractor charge-out rate.' },
      { item: 'formwork carpenter basic wage', value: 190, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/oman', checkedAt: '2026-11-11', note: 'OMR 160-270 range; OMR 190 overseas-intake basic median. Not a contractor charge-out rate.' },
    ],
  },
  BH: {
    currency: 'BHD',
    benchmarks: [
      { item: '12 mm reinforcement steel (market average)', value: 301, unit: 'tonne', status: 'market-survey', source: 'https://www.gccpricing.com/bahrain-construction-prices', checkedAt: '2026-11-11', note: 'Bahrain country page reports BHD 301/tonne average steel price; confirm grade, delivery and supplier quotation.' },
      { item: 'Portland cement', value: 24, unit: 'tonne', status: 'market-survey', source: 'https://www.albiladpress.com/news/2026/6407/finance/995340.html', checkedAt: '2026-11-11', note: 'Bahrain supplier-sector report dated 30 Apr 2026; reported market price BHD 24/tonne. Older observation; obtain a current supplier quote.' },
      { item: 'Washed sand', value: 10.7, unit: 'm³', status: 'market-survey', source: 'https://www.albiladpress.com/news/2026/6407/finance/995340.html', checkedAt: '2026-11-11', note: 'Calculated from the reported BHD 107 per 10 m³ shipment on 30 Apr 2026. Delivery and grade may vary; refresh with supplier quotes.' },
      { item: 'Ready-mix concrete (reported market average)', value: 33, unit: 'm³', status: 'market-survey', source: 'https://www.albiladpress.com/news/2026/6407/finance/995340.html', checkedAt: '2026-11-11', note: 'Bahrain supplier-sector average reported on 30 Apr 2026; mix grade and delivery specification were not stated. Do not substitute for a specified mix quote.' },
      { item: 'Concrete block (reported market price)', value: 0.24, unit: 'piece', status: 'market-survey', source: 'https://www.albiladpress.com/news/2026/6407/finance/995340.html', checkedAt: '2026-11-11', note: 'BHD 0.240 per block reported on 30 Apr 2026; block dimensions/type were not stated. Confirm specification and current price.' },
      { item: 'C20/25 ready-mix concrete, 75 mm slump', value: 26.4, unit: 'm³', status: 'market-survey', source: 'https://www.gccpricing.com/materials/ready-mix-concrete-c20-price-bahrain', checkedAt: '2026-11-11', note: 'Bahrain local observed rate, delivered basis; specification C20/25 and 75 mm slump. Obtain project-specific quote.' },
      { item: 'C40/50 ready-mix concrete, 100 mm slump', value: 34.16, unit: 'm³', status: 'market-survey', source: 'https://www.gccpricing.com/materials/ready-mix-concrete-c40-price-bahrain', checkedAt: '2026-11-11', note: 'Bahrain local observed rate, delivered basis; specification C40/50 and 100 mm slump. Obtain project-specific quote.' },
      { item: 'electrician basic wage', value: 200, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/bahrain', checkedAt: '2026-11-11', note: 'Median overseas-intake basic salary; BHD 170–280 observed span. Housing, transport, food and overtime are separate.' },
      { item: 'plumber basic wage', value: 195, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/bahrain', checkedAt: '2026-11-11', note: 'Median overseas-intake basic salary; BHD 160–270 observed span. Housing, transport, food and overtime are separate.' },
      { item: 'formwork carpenter basic wage', value: 200, unit: 'month', status: 'market-survey', source: 'https://tajhrservices.com/salary-guide/bahrain', checkedAt: '2026-11-11', note: 'Median overseas-intake basic salary; BHD 170–280 observed span. Housing, transport, food and overtime are separate.' },
      { item: '6-wheel truck transport (local city trip)', value: 15, unit: 'trip', status: 'market-survey', source: 'https://transportation.athletekart.com/', checkedAt: '2026-11-11', note: 'Published starting price for local Bahrain transport; outside-city starting price BHD 22. Confirm route, waiting time and cargo.' },
      { item: 'HIAB 5-ton truck crane hire', value: 75, unit: '8-hour booking', status: 'market-survey', source: 'https://transportation.athletekart.com/ar/hiab-rental', checkedAt: '2026-11-11', note: 'Published Bahrain base price for an 8-hour hire; overtime is extra. Confirm availability, operator, lifting plan and site access.' },
      { item: 'HIAB 10-ton truck crane hire', value: 85, unit: '8-hour booking', status: 'market-survey', source: 'https://transportation.athletekart.com/ar/hiab-rental', checkedAt: '2026-11-11', note: 'Published Bahrain base price for an 8-hour hire; overtime is extra. Confirm availability, operator, lifting plan and site access.' },
    ],
  },
};

// Directly mappable local material/service observations. Values are in the
// selected market currency and the corresponding COST_ITEMS unit. They are
// intentionally sparse: unsupported items remain zero and are flagged by the
// calculator rather than being filled with Lebanon rates or an FX multiplier.
export const COUNTRY_ITEM_RATE_DEFAULTS: Partial<
  Record<'AE' | 'SA' | 'QA' | 'KW' | 'OM' | 'BH', Record<string, { material: number; labor: number }>>
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
    coldWaterPoints: { material: 0, labor: 39 }, // 1.5 plumber hours/point × AED208/8h
    hotWaterPoints: { material: 0, labor: 39 },
    toiletConnections: { material: 0, labor: 39 },
    showerConnections: { material: 0, labor: 39 },
    basinConnections: { material: 0, labor: 39 },
    kitchenConnections: { material: 0, labor: 39 },
    floorTiles: { material: 0, labor: 7.88 }, // 0.45 skilled-trade hours/m² × AED17.50/hr
    falseCeiling: { material: 20, labor: 7.88 }, // T&T plasterboard material; frame excluded
    wallPrimer: { material: 0, labor: 2.85 }, // 0.12 painter hours/m² × AED190/8h
    wallPutty: { material: 0, labor: 2.85 },
    interiorPaint: { material: 0, labor: 2.85 },
    exteriorPaint: { material: 0, labor: 2.85 },
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
    footingConcrete: { material: 24.85, labor: 0 }, // GCCPricing C30/37 delivered reference parity, KWD/m³; verify local supplier quote
    columnConcrete: { material: 24.85, labor: 0 },
    stairConcrete: { material: 24.85, labor: 0 },
    beamConcrete: { material: 24.85, labor: 0 },
    slabConcrete: { material: 24.85, labor: 0 },
    foundationSteel: { material: 0.245, labor: 0 }, // GCCPricing KWD245/t converted to kg
    structuralSteel: { material: 0.245, labor: 0 },
    externalBlocks: { material: 7.375, labor: 0 }, // KWD0.59 × 12.5 blocks/m², 200 mm hollow CMU, supply-only
    cementMasonry: { material: 3, labor: 0 }, // GCCPricing KWD/50 kg bag
  },
  OM: {
    footingConcrete: { material: 31.15, labor: 0 }, // GCCPricing C30/37 delivered reference parity, OMR/m³; verify local supplier quote
    columnConcrete: { material: 31.15, labor: 0 },
    stairConcrete: { material: 31.15, labor: 0 },
    beamConcrete: { material: 31.15, labor: 0 },
    slabConcrete: { material: 31.15, labor: 0 },
    foundationSteel: { material: 0.307, labor: 0 }, // GCCPricing OMR307/t converted to kg
    structuralSteel: { material: 0.307, labor: 0 },
    externalBlocks: { material: 2.13, labor: 0 }, // MCP 20 cm hollow block OMR0.17 each × 12.5 blocks/m²
    cementMasonry: { material: 1.6, labor: 0 }, // Al Wusta Oct 2026 field-survey midpoint, OMR/50 kg bag; regional provisional anchor
  },
  BH: {
    footingConcrete: { material: 30.54, labor: 0 }, // Bahrain observed C30 delivered reference, BHD/m³; confirm mix and quote
    columnConcrete: { material: 30.54, labor: 0 },
    stairConcrete: { material: 30.54, labor: 0 },
    beamConcrete: { material: 30.54, labor: 0 },
    slabConcrete: { material: 30.54, labor: 0 },
    foundationSteel: { material: 0.301, labor: 0 }, // BHD 301/tonne market average converted to kg
    structuralSteel: { material: 0.301, labor: 0 },
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
  'regional-reference': {
    en: 'Regional parity reference — verify local quote',
    ar: 'مرجع إقليمي للمقارنة — يجب التحقق من عرض محلي',
    fr: 'Référence régionale indicative — devis local à vérifier',
  },
  provisional: {
    en: 'Provisional planning estimate',
    ar: 'تقدير تخطيطي أولي',
    fr: 'Estimation provisoire de planification',
  },
} as const;
