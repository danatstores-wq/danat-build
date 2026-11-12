import { ConstructionMarketBenchmarks } from './constructionMarketBenchmarks';

export type PublishedMarketBenchmarks = {
  version: string;
  publishedAt: string;
  countries: Record<'LB' | 'AE' | 'SA' | 'QA' | 'KW' | 'OM' | 'BH' | 'EG' | 'IQ', ConstructionMarketBenchmarks>;
};

// Generated from the Firebase benchmark master during publishing.
// The app imports this static snapshot and performs no benchmark Firestore reads.
export const PUBLISHED_MARKET_BENCHMARKS: PublishedMarketBenchmarks = {
  "version": "2026-11-11",
  "publishedAt": "2026-11-11",
  "countries": {
    "BH": {
      "currency": "BHD",
      "benchmarks": [
        {
          "value": 301,
          "unit": "tonne",
          "status": "market-survey",
          "item": "12 mm reinforcement steel (market average)",
          "checkedAt": "2026-11-11",
          "note": "Bahrain country page reports BHD 301/tonne average steel price; confirm grade, delivery and supplier quotation.",
          "source": "https://www.gccpricing.com/bahrain-construction-prices"
        },
        {
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "note": "Bahrain supplier-sector report dated 30 Apr 2026; reported market price BHD 24/tonne. Older observation; obtain a current supplier quote.",
          "unit": "tonne",
          "source": "https://www.albiladpress.com/news/2026/6407/finance/995340.html",
          "value": 24,
          "item": "Portland cement"
        },
        {
          "unit": "m³",
          "source": "https://www.albiladpress.com/news/2026/6407/finance/995340.html",
          "item": "Washed sand",
          "value": 10.7,
          "status": "market-survey",
          "note": "Calculated from the reported BHD 107 per 10 m³ shipment on 30 Apr 2026. Delivery and grade may vary; refresh with supplier quotes.",
          "checkedAt": "2026-11-11"
        },
        {
          "status": "market-survey",
          "unit": "m³",
          "checkedAt": "2026-11-11",
          "item": "Ready-mix concrete (reported market average)",
          "value": 33,
          "source": "https://www.albiladpress.com/news/2026/6407/finance/995340.html",
          "note": "Bahrain supplier-sector average reported on 30 Apr 2026; mix grade and delivery specification were not stated. Do not substitute for a specified mix quote."
        },
        {
          "source": "https://www.albiladpress.com/news/2026/6407/finance/995340.html",
          "item": "Concrete block (reported market price)",
          "unit": "piece",
          "status": "market-survey",
          "value": 0.24,
          "note": "BHD 0.240 per block reported on 30 Apr 2026; block dimensions/type were not stated. Confirm specification and current price.",
          "checkedAt": "2026-11-11"
        },
        {
          "value": 26.4,
          "unit": "m³",
          "status": "market-survey",
          "item": "C20/25 ready-mix concrete, 75 mm slump",
          "checkedAt": "2026-11-11",
          "note": "Bahrain local observed rate, delivered basis; specification C20/25 and 75 mm slump. Obtain project-specific quote.",
          "source": "https://www.gccpricing.com/materials/ready-mix-concrete-c20-price-bahrain"
        },
        {
          "source": "https://www.gccpricing.com/materials/ready-mix-concrete-c40-price-bahrain",
          "item": "C40/50 ready-mix concrete, 100 mm slump",
          "checkedAt": "2026-11-11",
          "unit": "m³",
          "status": "market-survey",
          "value": 34.16,
          "note": "Bahrain local observed rate, delivered basis; specification C40/50 and 100 mm slump. Obtain project-specific quote."
        },
        {
          "source": "https://tajhrservices.com/salary-guide/bahrain",
          "item": "electrician basic wage",
          "unit": "month",
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "note": "Median overseas-intake basic salary; BHD 170–280 observed span. Housing, transport, food and overtime are separate.",
          "value": 200
        },
        {
          "value": 195,
          "unit": "month",
          "status": "market-survey",
          "item": "plumber basic wage",
          "checkedAt": "2026-11-11",
          "source": "https://tajhrservices.com/salary-guide/bahrain",
          "note": "Median overseas-intake basic salary; BHD 160–270 observed span. Housing, transport, food and overtime are separate."
        },
        {
          "value": 200,
          "unit": "month",
          "status": "market-survey",
          "item": "formwork carpenter basic wage",
          "checkedAt": "2026-11-11",
          "note": "Median overseas-intake basic salary; BHD 170–280 observed span. Housing, transport, food and overtime are separate.",
          "source": "https://tajhrservices.com/salary-guide/bahrain"
        },
        {
          "source": "https://transportation.athletekart.com/",
          "note": "Published starting price for local Bahrain transport; outside-city starting price BHD 22. Confirm route, waiting time and cargo.",
          "checkedAt": "2026-11-11",
          "unit": "trip",
          "status": "market-survey",
          "value": 15,
          "item": "6-wheel truck transport (local city trip)"
        },
        {
          "note": "Published Bahrain base price for an 8-hour hire; overtime is extra. Confirm availability, operator, lifting plan and site access.",
          "value": 75,
          "source": "https://transportation.athletekart.com/ar/hiab-rental",
          "checkedAt": "2026-11-11",
          "item": "HIAB 5-ton truck crane hire",
          "unit": "8-hour booking",
          "status": "market-survey"
        },
        {
          "status": "market-survey",
          "unit": "8-hour booking",
          "item": "HIAB 10-ton truck crane hire",
          "value": 85,
          "source": "https://transportation.athletekart.com/ar/hiab-rental",
          "checkedAt": "2026-11-11",
          "note": "Published Bahrain base price for an 8-hour hire; overtime is extra. Confirm availability, operator, lifting plan and site access."
        }
      ]
    },
    "LB": {
      "benchmarks": [
        {
          "value": 96,
          "note": "Ministry of Industry Decision 52/1, 1 July 2026; factory-gate maximum, excluding VAT. Not a delivered retail price.",
          "source": "https://www.mtv.com.lb/news/محليات/1712965/عيسى-الخوري-يحدّد-سعر-طن-الاسمنت-الأسود",
          "unit": "tonne",
          "checkedAt": "2026-11-11",
          "item": "black cement factory-gate ceiling",
          "status": "published"
        },
        {
          "item": "Portland cement CEM I 42.5N",
          "source": "https://ayass-boutique.store/en/product/portland-cement-50kg",
          "unit": "50 kg bag",
          "status": "published",
          "note": "Beirut retailer online listing; stock could not be independently reconfirmed on 11 November 2026. Supply-only; confirm current stock, delivery and checkout price.",
          "value": 8.5,
          "checkedAt": "2026-11-11"
        },
        {
          "value": 970,
          "unit": "tonne",
          "status": "market-survey",
          "item": "12 mm reinforcement steel",
          "checkedAt": "2026-11-11",
          "source": "https://lebanoneconomy.net/الترميم-يواجه-تحدّي-ضبط-الأسعار/",
          "note": "Lebanon market report, 2026; reported market level around USD 970/tonne. Verify grade, delivery and current supplier quotation."
        },
        {
          "source": "https://lebanoneconomy.net/الترميم-يواجه-تحدّي-ضبط-الأسعار/",
          "item": "general construction worker wage",
          "unit": "day",
          "status": "market-survey",
          "value": 50,
          "note": "Lebanon market report, 2026; reported daily labour cost from USD 50. Not a skilled-trade wage schedule or contractor charge-out rate.",
          "checkedAt": "2026-11-11"
        },
        {
          "value": 65,
          "item": "building stone",
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "unit": "100 pieces",
          "note": "Midpoint of reported USD 60–70 per 100 stones; size, quarry and delivery affect price.",
          "source": "https://lebanoneconomy.net/الترميم-يواجه-تحدّي-ضبط-الأسعار/"
        },
        {
          "value": 18.5,
          "checkedAt": "2026-11-11",
          "unit": "m²",
          "status": "published",
          "item": "porcelain floor tile 60x60",
          "source": "https://ayass-boutique.store/en/product/porcelain-floor-tile-60x60",
          "note": "Beirut retailer online listing; 600×600 mm, 9 mm, R10 matt porcelain; material only, installation excluded. Stock could not be independently reconfirmed on 11 November 2026; confirm stock, delivery and checkout price."
        },
        {
          "checkedAt": "2026-11-11",
          "note": "Beirut retailer online listing; 300×600 mm glazed wall tile; material only, installation excluded. Stock could not be independently reconfirmed on 11 November 2026; confirm stock, delivery and checkout price.",
          "value": 11,
          "status": "published",
          "item": "ceramic wall tile 30x60",
          "unit": "m²",
          "source": "https://ayass-boutique.store/en/product/ceramic-wall-tile-30x60"
        },
        {
          "unit": "25 kg bag",
          "source": "https://ayass-boutique.store/en",
          "checkedAt": "2026-11-11",
          "item": "tile adhesive C2TE 25kg",
          "value": 13,
          "status": "published",
          "note": "Beirut retailer online listing; one 25 kg bag; coverage depends on trowel size and substrate. Stock could not be independently reconfirmed on 11 November 2026; confirm stock, delivery and checkout price."
        },
        {
          "source": "https://ayass-boutique.store/en/product/white-cement-50kg",
          "note": "Beirut retailer online listing; white cement for decorative/rendering use, not interchangeable with black structural cement. Stock could not be independently reconfirmed on 11 November 2026; confirm stock, delivery and checkout price.",
          "unit": "50 kg bag",
          "checkedAt": "2026-11-11",
          "status": "published",
          "value": 16,
          "item": "white cement"
        }
      ],
      "currency": "USD"
    },
    "OM": {
      "benchmarks": [
        {
          "value": 248.5,
          "status": "market-survey",
          "note": "Indicative supplier gateway price; confirm stock and delivery.",
          "unit": "tonne",
          "checkedAt": "2026-11-11",
          "source": "https://madaar.om/",
          "item": "12 mm rebar"
        },
        {
          "item": "16 mm rebar",
          "value": 246.1,
          "unit": "tonne",
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "note": "Indicative supplier gateway price; confirm stock and delivery.",
          "source": "https://madaar.om/"
        },
        {
          "note": "Indicative midpoint of OMR 1.45–1.75 observed across named brands in Al Wusta on 8 Oct 2026; regional supplier survey, not a national average.",
          "value": 1.6,
          "status": "published",
          "checkedAt": "2026-11-11",
          "item": "Raysut cement (Al Wusta field survey)",
          "unit": "50 kg bag",
          "source": "https://shabiba.com/article/212280-%D9%84%D9%84%D9%85%D9%82%D8%A8%D9%84%D9%8A%D9%86-%D8%A8%D8%A7%D9%84%D8%A8%D9%86%D8%A7-%D8%A8%D8%A7%D9%84%D9%88%D8%B3%D8%B7%D9%89-%D9%83%D9%85-%D8%A8%D9%84%D8%BA%D8%AA-%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1-%D8%A7%D9%84%D8%A3%D8%B3%D9%85%D9%86%D8%AA-%D9%88%D8%A7%D9%84%D8%AD%D8%AF%D9%8A%D8%AF-%D9%81%D9%8A-%D9%85%D9%86%D8%A7%D9%81%D8%B0-%D8%A7%D9%84%D8%A8%D9%8A%D8%B9"
        },
        {
          "source": "https://www.gccpricing.com/oman-construction-prices",
          "item": "OPC/SRC cement (GCCPricing index)",
          "unit": "50 kg bag",
          "status": "market-survey",
          "note": "Separate portal benchmark; differs materially from the October Al Wusta field observations and needs supplier verification.",
          "value": 3,
          "checkedAt": "2026-11-11"
        },
        {
          "note": "Delivered OMR 31.15/m³ GCCPricing reference-parity benchmark updated 26 Oct 2026; not a direct local merchant submission. Retains BinaaSouq OMR 24–38/m³ range as an independent local supplier cross-check.",
          "value": 31.15,
          "source": "https://www.gccpricing.com/materials/ready-mix-concrete-c30-price-kuwait",
          "item": "ready-mix concrete C30/37",
          "unit": "m³",
          "checkedAt": "2026-11-11",
          "status": "market-survey"
        },
        {
          "source": "https://www.gccpricing.com/materials/cmu-hollow-block-200mm-price-kuwait",
          "item": "CMU hollow block 200 mm",
          "unit": "piece",
          "status": "market-survey",
          "value": 0.74,
          "checkedAt": "2026-11-11",
          "note": "Local-origin 400×200×200 mm hollow CMU, supply-only; updated 5 days ago. Materially higher than Al Madina manufacturer OMR 0.165–0.175 listing, so not used as the starter block rate pending supplier reconciliation."
        },
        {
          "status": "market-survey",
          "item": "hollow block",
          "unit": "piece",
          "checkedAt": "2026-11-11",
          "note": "Lower end of listed OMR 0.22-0.38 per block range.",
          "source": "https://binaasouq.com/",
          "value": 0.22
        },
        {
          "checkedAt": "2026-11-11",
          "value": 0.17,
          "note": "Omani manufacturer published OMR 0.165-0.175 per piece; delivery area changes price.",
          "source": "https://www.mcp.om/en/cement-blocks",
          "unit": "piece",
          "status": "published",
          "item": "regular 20 cm hollow block"
        },
        {
          "note": "Omani manufacturer published OMR 0.210-0.220 per piece; delivery area changes price.",
          "value": 0.215,
          "status": "published",
          "item": "20 cm solid block",
          "checkedAt": "2026-11-11",
          "unit": "piece",
          "source": "https://www.mcp.om/en/cement-blocks"
        },
        {
          "status": "market-survey",
          "note": "OMR 180-280 range; OMR 210 overseas-intake basic median. Housing/transport and employer costs are separate.",
          "unit": "month",
          "checkedAt": "2026-11-11",
          "source": "https://tajhrservices.com/salary-guide/oman",
          "value": 210,
          "item": "electrician basic wage"
        },
        {
          "value": 190,
          "unit": "month",
          "status": "market-survey",
          "item": "plumber basic wage",
          "checkedAt": "2026-11-11",
          "source": "https://tajhrservices.com/salary-guide/oman",
          "note": "OMR 160-260 range; OMR 190 overseas-intake basic median. Not a contractor charge-out rate."
        },
        {
          "value": 190,
          "status": "market-survey",
          "note": "OMR 160-270 range; OMR 190 overseas-intake basic median. Not a contractor charge-out rate.",
          "checkedAt": "2026-11-11",
          "unit": "month",
          "item": "formwork carpenter basic wage",
          "source": "https://tajhrservices.com/salary-guide/oman"
        }
      ],
      "currency": "OMR"
    },
    "KW": {
      "currency": "KWD",
      "benchmarks": [
        {
          "value": 245,
          "unit": "tonne",
          "source": "https://www.gccpricing.com/kuwait-construction-prices",
          "item": "deformed rebar Y8-Y32",
          "checkedAt": "2026-11-11",
          "status": "market-survey",
          "note": "Indicative GCCPricing benchmark; verify grade, delivery and supplier quote."
        },
        {
          "item": "cement",
          "value": 3,
          "unit": "50 kg bag",
          "status": "market-survey",
          "note": "Indicative GCCPricing benchmark.",
          "checkedAt": "2026-11-11",
          "source": "https://www.gccpricing.com/kuwait-construction-prices"
        },
        {
          "item": "ready-mix concrete C30/37",
          "source": "https://www.gccpricing.com/materials/ready-mix-concrete-c30-price-kuwait",
          "checkedAt": "2026-11-11",
          "unit": "m³",
          "status": "market-survey",
          "note": "Delivered KWD 24.85/m³ reference-parity benchmark updated 26 Oct 2026; GCCPricing labels Kuwait as calibrated parity rather than a direct local merchant submission.",
          "value": 24.85
        },
        {
          "checkedAt": "2026-11-11",
          "status": "market-survey",
          "note": "Local-origin 400×200×200 mm hollow CMU, supply-only; updated 5 days ago. 12.5 pieces/m² before waste; verify local supplier quote.",
          "unit": "piece",
          "source": "https://www.gccpricing.com/materials/cmu-hollow-block-200mm-price-kuwait",
          "value": 0.59,
          "item": "CMU hollow block 200 mm"
        },
        {
          "note": "NIC Kuwait online retail listing, 390×190×190 mm; page states 12 pieces/m². Sandlime block, not a generic concrete-block rate.",
          "value": 0.431,
          "source": "https://online.nicbm.com/en/item/block-17",
          "item": "17 cm limestone block",
          "checkedAt": "2026-11-11",
          "unit": "piece",
          "status": "published"
        },
        {
          "value": 0.202,
          "item": "9 cm hollow cement block",
          "source": "https://online.nicbm.com/en/item/hollow-blocks-39x19x09-cm-3-n-mm2",
          "unit": "piece",
          "note": "NIC Kuwait online retail listing, 390×190×90 mm; page states 25 pieces/m². Check stated coverage against actual laying pattern before BOQ conversion.",
          "status": "published",
          "checkedAt": "2026-11-11"
        },
        {
          "source": "https://tajhrservices.com/salary-guide/kuwait",
          "note": "KWD 150-250 range; KWD 185 overseas-intake basic median. Housing/transport and employer costs are separate.",
          "unit": "month",
          "status": "market-survey",
          "value": 185,
          "checkedAt": "2026-11-11",
          "item": "electrician basic wage"
        },
        {
          "note": "KWD 150-260 range; KWD 180 overseas-intake basic median. Not a contractor charge-out rate.",
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "item": "formwork carpenter basic wage",
          "source": "https://tajhrservices.com/salary-guide/kuwait",
          "unit": "month",
          "value": 180
        },
        {
          "note": "KWD 140-230 range; KWD 170 overseas-intake basic median. Not a contractor charge-out rate.",
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "item": "plumber basic wage",
          "source": "https://tajhrservices.com/salary-guide/kuwait",
          "unit": "month",
          "value": 170
        }
      ]
    },
    "EG": {
      "currency": "EGP",
      "benchmarks": [
        {
          "value": 3880,
          "checkedAt": "2026-11-11",
          "note": "Greater Cairo factory/distributor observation dated 10 Nov 2026; VAT basis not stated. Confirm brand, delivery and tax on supplier quotation.",
          "source": "https://prices.qsmind.app/en/egypt",
          "unit": "tonne",
          "status": "market-survey",
          "item": "CEM I 42.5N cement (Suez)"
        },
        {
          "item": "Misr Steel reinforcement rebar",
          "value": 36000,
          "unit": "tonne",
          "status": "market-survey",
          "note": "Mill list price dated 9 Nov 2026, ex-works; excludes transport and dealer margin. VAT not stated.",
          "source": "https://prices.qsmind.app/en/egypt",
          "checkedAt": "2026-11-11"
        },
        {
          "value": 3900,
          "checkedAt": "2026-11-11",
          "unit": "m³",
          "source": "https://prices.qsmind.app/en/egypt/concrete",
          "item": "Ready-mix concrete C30 (300 kg/cm²)",
          "status": "market-survey",
          "note": "Greater Cairo supplier list price dated 10 Oct 2026; delivered within Greater Cairo, pumping priced separately. Confirm current quote."
        },
        {
          "note": "Greater Cairo washed, graded natural aggregate for higher-strength/exposed concrete; market observation dated 1 Nov 2026, full-load delivered basis, VAT included.",
          "source": "https://prices.qsmind.app/ar/egypt/aggregates",
          "checkedAt": "2026-11-11",
          "item": "Washed special aggregate",
          "status": "market-survey",
          "unit": "m³",
          "value": 430
        },
        {
          "value": 210,
          "unit": "m³",
          "checkedAt": "2026-11-11",
          "status": "market-survey",
          "item": "Coarse sand",
          "source": "https://prices.qsmind.app/ar/egypt/aggregates",
          "note": "Greater Cairo coarse sand observation dated 16 Oct 2026; marked stale by source, VAT included, transport excluded. Do not treat as a current delivered rate."
        },
        {
          "value": 2500,
          "checkedAt": "2026-11-11",
          "source": "https://prices.qsmind.app/en/egypt",
          "note": "Greater Cairo ex-factory observation dated 21 Oct 2026; transport excluded. Confirm brick strength and current factory price.",
          "unit": "1,000 bricks",
          "status": "market-survey",
          "item": "Solid cement bricks 25×12×6 cm"
        },
        {
          "note": "Cleopatra first-grade ceramic, Cairo retailer supply-only price dated 21 Oct 2026; installation and delivery excluded.",
          "value": 264,
          "source": "https://prices.qsmind.app/en/egypt/finishes",
          "item": "Ceramic floor tile 60×60 first grade",
          "checkedAt": "2026-11-11",
          "unit": "m²",
          "status": "market-survey"
        },
        {
          "checkedAt": "2026-11-11",
          "value": 424,
          "note": "Egyptian-made first-grade porcelain, Cairo retailer supply-only price dated 21 Oct 2026; installation and delivery excluded.",
          "source": "https://prices.qsmind.app/en/egypt/finishes",
          "unit": "m²",
          "item": "Porcelain floor tile 60×60 first grade",
          "status": "market-survey"
        },
        {
          "checkedAt": "2026-11-11",
          "note": "Retail price dated 3 Nov 2026 for standard grey cementitious adhesive; confirm coverage and suitability for tile type.",
          "value": 175,
          "status": "market-survey",
          "item": "Tile adhesive CMB Cetox U",
          "unit": "25 kg bag",
          "source": "https://prices.qsmind.app/en/egypt/finishes"
        },
        {
          "value": 1165,
          "note": "Greater Cairo retail price dated 3 Nov 2026; white interior matt emulsion, approx. 14 kg. Coverage depends on substrate and coats.",
          "source": "https://prices.qsmind.app/en/egypt/finishes",
          "unit": "9 L pail",
          "checkedAt": "2026-11-11",
          "item": "Interior plastic paint Sipes 700",
          "status": "market-survey"
        },
        {
          "note": "Cairo plastic-paint labour-only rate dated 9 Nov 2026; materials excluded.",
          "status": "market-survey",
          "item": "Interior painting labour",
          "source": "https://prices.qsmind.app/en/egypt/finishes",
          "unit": "m²",
          "value": 59,
          "checkedAt": "2026-11-11"
        },
        {
          "item": "Tiling labour",
          "value": 112,
          "unit": "m²",
          "status": "market-survey",
          "note": "Cairo floor and wall tiling labour-only rate dated 9 Nov 2026; tiles, adhesive and grout excluded.",
          "source": "https://prices.qsmind.app/en/egypt/finishes",
          "checkedAt": "2026-11-11"
        },
        {
          "value": 3650,
          "unit": "day",
          "item": "Hydraulic excavator rental (about 20 t)",
          "source": "https://prices.qsmind.app/en/egypt/equipment",
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "note": "Greater Cairo daily rate derived from monthly rental ÷ 26 working days; observation dated 28 Oct 2026. Operator, fuel and mobilisation are not stated/included."
        },
        {
          "source": "https://prices.qsmind.app/en/egypt/equipment",
          "checkedAt": "2026-11-11",
          "note": "Greater Cairo one-day rental observation dated 9 Jun 2026; operator/fuel inclusion not stated and transport to site excluded.",
          "unit": "8-hour day",
          "status": "market-survey",
          "value": 2750,
          "item": "Wheel loader rental"
        }
      ]
    },
    "AE": {
      "currency": "AED",
      "benchmarks": [
        {
          "status": "published",
          "note": "Dubai indicative index, October 2026, excluding VAT.",
          "unit": "50 kg bag",
          "source": "https://quantohq.com/price-index.html",
          "value": 15.75,
          "checkedAt": "2026-11-11",
          "item": "cement"
        },
        {
          "status": "published",
          "checkedAt": "2026-11-11",
          "note": "Emirates Steel delivered-to-Dubai indicative benchmark; ex-works and retail quotes differ.",
          "unit": "tonne",
          "source": "https://quantohq.com/price-index.html",
          "value": 2936,
          "item": "rebar"
        },
        {
          "unit": "m³",
          "source": "https://quantohq.com/price-index.html",
          "item": "C40 ready-mix concrete",
          "value": 261,
          "status": "published",
          "checkedAt": "2026-11-11",
          "note": "Dubai indicative index, excluding VAT."
        },
        {
          "value": 206,
          "unit": "9-hour day",
          "source": "https://prices.qsmind.app/en/uae/labour",
          "item": "formwork carpenter",
          "checkedAt": "2026-11-11",
          "status": "market-survey",
          "note": "Dubai labor survey; do not treat as a per-m² installed rate."
        },
        {
          "unit": "8-hour day",
          "source": "https://prices.qsmind.app/en/uae/labour",
          "item": "plasterer",
          "value": 164,
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "note": "Dubai labor survey; supplier-provided accommodation/transport assumptions apply."
        },
        {
          "status": "market-survey",
          "source": "https://prices.qsmind.app/en/uae/labour",
          "item": "electrician",
          "value": 208,
          "unit": "8-hour day",
          "checkedAt": "2026-11-11"
        },
        {
          "item": "plumber",
          "checkedAt": "2026-11-11",
          "value": 208,
          "unit": "8-hour day",
          "source": "https://prices.qsmind.app/en/uae/labour",
          "note": "Dubai labour survey; AED 208 per 8-hour working day.",
          "status": "market-survey"
        },
        {
          "status": "market-survey",
          "note": "Dubai labour survey; AED 190 per 8-hour working day.",
          "unit": "8-hour day",
          "source": "https://prices.qsmind.app/en/uae/labour",
          "value": 190,
          "item": "painter",
          "checkedAt": "2026-11-11"
        },
        {
          "item": "footing excavation",
          "source": "https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance",
          "unit": "m³ installed",
          "checkedAt": "2026-11-11",
          "status": "market-survey",
          "note": "Dubai 2025 measured rate; large-project reference, excludes unrelated earthworks.",
          "value": 25
        },
        {
          "value": 5000,
          "unit": "tonne installed",
          "status": "market-survey",
          "item": "reinforcement",
          "checkedAt": "2026-11-11",
          "note": "Dubai 2025 beam reinforcement measured rate; not steel supply price.",
          "source": "https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance"
        },
        {
          "unit": "m² installed",
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "item": "blockwork",
          "value": 180,
          "source": "https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance",
          "note": "Dubai 2025, 200 mm solid concrete block wall, bulk project."
        },
        {
          "source": "https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance",
          "item": "ceramic floor tiles",
          "unit": "m² installed",
          "status": "market-survey",
          "value": 150,
          "note": "Dubai 2025 standard ceramic tile, 1,000 m² project.",
          "checkedAt": "2026-11-11"
        },
        {
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "note": "Dubai 2025 including frame and hardware; 50-door project.",
          "unit": "piece installed",
          "source": "https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance",
          "value": 4000,
          "item": "single solid-core door"
        }
      ]
    },
    "QA": {
      "benchmarks": [
        {
          "unit": "m³",
          "status": "market-survey",
          "item": "crushed stone 0-32 mm",
          "value": 62,
          "source": "https://boqcalc.com/countries/qatar",
          "note": "Commercial market estimate, not an official schedule.",
          "checkedAt": "2026-11-11"
        },
        {
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "item": "sand 0-4 mm",
          "unit": "m³",
          "source": "https://boqcalc.com/countries/qatar",
          "value": 72,
          "note": "Commercial market estimate, not an official schedule."
        },
        {
          "unit": "m³",
          "source": "https://boqcalc.com/countries/qatar",
          "item": "C25/30 ready-mix concrete",
          "checkedAt": "2026-11-11",
          "value": 270,
          "status": "market-survey",
          "note": "Commercial market estimate; delivery/pumping must be checked separately."
        },
        {
          "status": "market-survey",
          "note": "Commercial market estimate.",
          "unit": "25 kg bag",
          "checkedAt": "2026-11-11",
          "source": "https://boqcalc.com/countries/qatar",
          "value": 17,
          "item": "cement"
        },
        {
          "value": 37.42,
          "unit": "hour",
          "status": "market-survey",
          "item": "concrete worker",
          "source": "https://boqcalc.com/countries/qatar",
          "note": "Hourly labor benchmark; do not treat as a per-unit installed rate.",
          "checkedAt": "2026-11-11"
        },
        {
          "source": "https://boqcalc.com/countries/qatar",
          "checkedAt": "2026-11-11",
          "note": "Hourly labor benchmark; do not treat as a per-point installed rate.",
          "unit": "hour",
          "status": "market-survey",
          "value": 46.77,
          "item": "electrician"
        },
        {
          "source": "https://boqcalc.com/countries/qatar",
          "item": "plumber",
          "unit": "hour",
          "status": "market-survey",
          "note": "Hourly labor benchmark; do not treat as a per-point installed rate.",
          "value": 46.77,
          "checkedAt": "2026-11-11"
        },
        {
          "value": 42.09,
          "unit": "hour",
          "checkedAt": "2026-11-11",
          "source": "https://boqcalc.com/countries/qatar",
          "item": "tiler",
          "status": "market-survey",
          "note": "Hourly labor benchmark; do not treat as a per-m² installed rate."
        },
        {
          "source": "https://www.carbonblueglobal.com/services/quantity-surveying",
          "item": "ordinary soil excavation",
          "unit": "m³ installed",
          "checkedAt": "2026-11-11",
          "status": "market-survey",
          "note": "Illustrative Qatar BOQ sample rate; large measured quantity.",
          "value": 28
        },
        {
          "source": "https://www.carbonblueglobal.com/services/quantity-surveying",
          "note": "Illustrative Qatar BOQ sample rate; specification-specific.",
          "checkedAt": "2026-11-11",
          "unit": "m³ installed",
          "status": "market-survey",
          "value": 310,
          "item": "blinding concrete C15"
        },
        {
          "value": 395,
          "checkedAt": "2026-11-11",
          "item": "reinforced concrete C35 foundations",
          "source": "https://www.carbonblueglobal.com/services/quantity-surveying",
          "unit": "m³ installed",
          "note": "Illustrative Qatar BOQ sample rate; includes supply and installation.",
          "status": "market-survey"
        },
        {
          "source": "https://www.carbonblueglobal.com/services/quantity-surveying",
          "unit": "m² installed",
          "item": "hollow blockwork 200 mm",
          "checkedAt": "2026-11-11",
          "value": 62,
          "status": "market-survey",
          "note": "Illustrative Qatar BOQ sample rate."
        },
        {
          "source": "https://www.carbonblueglobal.com/services/quantity-surveying",
          "note": "Illustrative Qatar BOQ sample rate, 15 mm internal.",
          "checkedAt": "2026-11-11",
          "status": "market-survey",
          "item": "internal cement plaster",
          "value": 34,
          "unit": "m² installed"
        },
        {
          "status": "market-survey",
          "item": "porcelain floor tiling",
          "unit": "m² installed",
          "checkedAt": "2026-11-11",
          "source": "https://www.carbonblueglobal.com/services/quantity-surveying",
          "value": 145,
          "note": "Illustrative Qatar BOQ sample rate."
        },
        {
          "checkedAt": "2026-11-11",
          "status": "market-survey",
          "note": "Illustrative Qatar BOQ sample rate.",
          "source": "https://www.carbonblueglobal.com/services/quantity-surveying",
          "item": "two-coat emulsion paint",
          "value": 16,
          "unit": "m² installed"
        },
        {
          "source": "https://www.ashghal.gov.qa/en/Services/Pages/PriceList.aspx",
          "unit": "tonne",
          "item": "bitumen 60/70",
          "checkedAt": "2026-11-12",
          "value": 2925,
          "status": "published",
          "note": "Ashghal official published price for November 2026; valid 1–30 November 2026."
        }
      ],
      "currency": "QAR"
    },
    "SA": {
      "currency": "SAR",
      "benchmarks": [
        {
          "value": 15.53,
          "note": "GASTAT September 2026 national average; VAT included.",
          "checkedAt": "2026-11-11",
          "source": "https://ibuild.sa/material-prices",
          "unit": "50 kg bag",
          "item": "black cement",
          "status": "published"
        },
        {
          "status": "published",
          "item": "12 mm rebar",
          "unit": "tonne",
          "source": "https://ibuild.sa/material-prices",
          "value": 3122.85,
          "note": "GASTAT September 2026 national average.",
          "checkedAt": "2026-11-11"
        },
        {
          "status": "published",
          "note": "GASTAT September 2026 national average.",
          "checkedAt": "2026-11-11",
          "item": "350K normal ready-mix concrete",
          "source": "https://ibuild.sa/material-prices",
          "value": 212.52,
          "unit": "m³"
        },
        {
          "item": "15 cm block",
          "source": "https://ibuild.sa/material-prices",
          "unit": "piece",
          "status": "published",
          "note": "Converted from SAR 1,677.78 per 1,000 pieces.",
          "value": 1.67778,
          "checkedAt": "2026-11-11"
        },
        {
          "status": "published",
          "note": "GASTAT September 2026 national average.",
          "checkedAt": "2026-11-11",
          "unit": "m³",
          "source": "https://ibuild.sa/material-prices",
          "value": 77.61,
          "item": "white soft sand"
        },
        {
          "note": "Riyadh labor benchmark; unit productivity is not implied.",
          "source": "https://prices.qsmind.app/en/saudi/labour",
          "status": "market-survey",
          "item": "mason",
          "checkedAt": "2026-11-11",
          "value": 16,
          "unit": "hour"
        },
        {
          "item": "steel fixer",
          "value": 16,
          "unit": "hour",
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "note": "Riyadh labor benchmark; unit productivity is not implied.",
          "source": "https://prices.qsmind.app/en/saudi/labour"
        },
        {
          "status": "market-survey",
          "note": "Riyadh labor benchmark; unit productivity is not implied.",
          "item": "tile mason",
          "source": "https://prices.qsmind.app/en/saudi/labour",
          "value": 18,
          "unit": "hour",
          "checkedAt": "2026-11-11"
        },
        {
          "checkedAt": "2026-11-11",
          "item": "plaster mason",
          "value": 15,
          "unit": "hour",
          "source": "https://prices.qsmind.app/en/saudi/labour",
          "note": "Riyadh labor benchmark; unit productivity is not implied.",
          "status": "market-survey"
        },
        {
          "item": "plumber",
          "value": 15,
          "unit": "hour",
          "source": "https://prices.qsmind.app/en/saudi/labour",
          "checkedAt": "2026-11-11",
          "note": "Riyadh labor benchmark; unit productivity is not implied.",
          "status": "market-survey"
        },
        {
          "status": "market-survey",
          "item": "machine excavation",
          "unit": "m³ installed",
          "source": "https://prices.qsmind.app/en/saudi/works",
          "value": 21.5,
          "note": "Riyadh normal soil, machine/operator/fuel included; rock and off-site disposal excluded.",
          "checkedAt": "2026-11-11"
        },
        {
          "status": "market-survey",
          "item": "internal cement plaster",
          "unit": "m² installed",
          "checkedAt": "2026-11-11",
          "source": "https://prices.qsmind.app/en/saudi/works",
          "note": "Riyadh supply and apply, approx. 2 cm, June 2026 observation.",
          "value": 26
        },
        {
          "value": 67.5,
          "unit": "m² installed",
          "item": "porcelain floor tiling",
          "source": "https://prices.qsmind.app/en/saudi/works",
          "checkedAt": "2026-11-11",
          "status": "market-survey",
          "note": "Riyadh mid-range 60x60 cm including adhesive, grout and skirting."
        },
        {
          "item": "internal emulsion painting",
          "value": 22,
          "unit": "m² installed",
          "status": "market-survey",
          "note": "Riyadh mid-range putty, sealer and two coats.",
          "checkedAt": "2026-11-11",
          "source": "https://prices.qsmind.app/en/saudi/works"
        },
        {
          "source": "https://prices.qsmind.app/en/saudi/works",
          "note": "Riyadh 4 mm torch-applied membrane system.",
          "status": "market-survey",
          "checkedAt": "2026-11-11",
          "item": "roof waterproofing",
          "value": 35,
          "unit": "m² installed"
        },
        {
          "status": "market-survey",
          "item": "gypsum board ceiling",
          "unit": "m² installed",
          "checkedAt": "2026-11-11",
          "note": "Riyadh 12.5 mm board and galvanized frame, ready for paint.",
          "source": "https://prices.qsmind.app/en/saudi/works",
          "value": 82.5
        },
        {
          "note": "Riyadh conduit and wiring, light fitting excluded.",
          "value": 85,
          "status": "market-survey",
          "item": "lighting point",
          "unit": "point installed",
          "checkedAt": "2026-11-11",
          "source": "https://prices.qsmind.app/en/saudi/works"
        },
        {
          "source": "https://prices.qsmind.app/en/saudi/works",
          "note": "Riyadh conduit, wiring and mid-range 13A outlet.",
          "unit": "point installed",
          "status": "market-survey",
          "value": 97.5,
          "checkedAt": "2026-11-11",
          "item": "socket outlet point"
        }
      ]
    },
    "IQ": {
      "currency": "IQD",
      "benchmarks": [
        {
          "value": 105000,
          "unit": "tonne",
          "status": "published",
          "item": "Ordinary cement (Iraqi origin)",
          "note": "COSIT February 2026 local-origin market observation; IQD 105 thousand per tonne. Origin-specific, not a delivered project quote.",
          "checkedAt": "2026-11-11",
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2026/%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%D8%A7%D9%84%D8%A7%D9%86%D8%B4%D8%A7%D8%A6%D9%8A%D8%A9%20%D9%84%D8%B4%D9%87%D8%B1%20%D8%B4%D8%A8%D8%A7%D8%B7%202026.pdf"
        },
        {
          "value": 972000,
          "unit": "tonne",
          "status": "published",
          "checkedAt": "2026-11-11",
          "item": "Reinforcement steel (Iraqi origin)",
          "note": "COSIT February 2026 local-origin market observation; IQD 972 thousand per tonne. Confirm steel grade, diameter, mill origin, delivery and VAT.",
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2026/%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%D8%A7%D9%84%D8%A7%D9%86%D8%B4%D8%A7%D8%A6%D9%8A%D8%A9%20%D9%84%D8%B4%D9%87%D8%B1%20%D8%B4%D8%A8%D8%A7%D8%B7%202026.pdf"
        },
        {
          "value": 10000,
          "status": "published",
          "note": "COSIT February 2026 Iraqi-origin observation; IQD 10 thousand/m². Tile grade, size and finish are not specified in this aggregate series.",
          "unit": "m²",
          "checkedAt": "2026-11-11",
          "item": "Ceramic tile",
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2026/%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%D8%A7%D9%84%D8%A7%D9%86%D8%B4%D8%A7%D8%A6%D9%8A%D8%A9%20%D9%84%D8%B4%D9%87%D8%B1%20%D8%B4%D8%A8%D8%A7%D8%B7%202026.pdf"
        },
        {
          "status": "published",
          "note": "COSIT 2025 average across reporting governorates; IQD 158 thousand per 1,000 pieces. Annual average, not a current city quotation.",
          "item": "Ordinary brick",
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2025/2025%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%20%20%D9%88%D8%A7%D8%AC%D9%88%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D9%84%D9%8A%D9%86%D8%A9.pdf",
          "checkedAt": "2026-11-11",
          "value": 158000,
          "unit": "1,000 pieces"
        },
        {
          "value": 203000,
          "unit": "1,000 pieces",
          "status": "published",
          "item": "Republic brick",
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2025/2025%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%20%20%D9%88%D8%A7%D8%AC%D9%88%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D9%84%D9%8A%D9%86%D8%A9.pdf",
          "checkedAt": "2026-11-11",
          "note": "COSIT 2025 average across reporting governorates; IQD 203 thousand per 1,000 pieces. Annual average, not a current city quotation."
        },
        {
          "unit": "1,000 pieces",
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2025/2025%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%20%20%D9%88%D8%A7%D8%AC%D9%88%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D9%84%D9%8A%D9%86%D8%A9.pdf",
          "item": "Medium-size concrete block",
          "value": 538000,
          "status": "published",
          "checkedAt": "2026-11-11",
          "note": "COSIT 2025 average across reporting governorates; IQD 538 thousand per 1,000 blocks. Dimensions and hollow/solid specification must be confirmed."
        },
        {
          "status": "published",
          "unit": "m³",
          "item": "Black sand",
          "value": 16000,
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2025/2025%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%20%20%D9%88%D8%A7%D8%AC%D9%88%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D9%84%D9%8A%D9%86%D8%A9.pdf",
          "checkedAt": "2026-11-11",
          "note": "COSIT 2025 governorate-average observation; IQD 16 thousand/m³. Confirm grading, source and transport."
        },
        {
          "value": 19000,
          "unit": "m³",
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2025/2025%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%20%20%D9%88%D8%A7%D8%AC%D9%88%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D9%84%D9%8A%D9%86%D8%A9.pdf",
          "item": "Red sand",
          "checkedAt": "2026-11-11",
          "status": "published",
          "note": "COSIT 2025 governorate-average observation; IQD 19 thousand/m³. Confirm grading, source and transport."
        },
        {
          "note": "COSIT 2025 annual average wage observation; IQD/day. This is a wage benchmark, not a contractor charge-out rate.",
          "value": 50634,
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2025/2025%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%20%20%D9%88%D8%A7%D8%AC%D9%88%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D9%84%D9%8A%D9%86%D8%A9.pdf",
          "checkedAt": "2026-11-11",
          "item": "Engineer daily wage",
          "unit": "day",
          "status": "published"
        },
        {
          "checkedAt": "2026-11-11",
          "status": "published",
          "note": "COSIT 2025 annual average wage observation; IQD/day. Housing, transport, employer contributions and contractor overhead are not added.",
          "item": "Skilled worker daily wage",
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2025/2025%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%20%20%D9%88%D8%A7%D8%AC%D9%88%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D9%84%D9%8A%D9%86%D8%A9.pdf",
          "value": 63806,
          "unit": "day"
        },
        {
          "note": "COSIT 2025 annual average wage observation; IQD/day. Not a contractor charge-out rate.",
          "checkedAt": "2026-11-11",
          "value": 32968,
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2025/2025%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%20%20%D9%88%D8%A7%D8%AC%D9%88%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D9%84%D9%8A%D9%86%D8%A9.pdf",
          "item": "Semi-skilled worker daily wage",
          "unit": "day",
          "status": "published"
        },
        {
          "note": "COSIT 2025 annual average wage observation; IQD/day. Not a contractor charge-out rate.",
          "value": 24283,
          "status": "published",
          "checkedAt": "2026-11-11",
          "item": "Unskilled worker daily wage",
          "unit": "day",
          "source": "https://cosit.gov.iq/documents/buildings/Employees%20wages/2025/2025%D9%86%D8%B4%D8%B1%D8%A9%20%D8%A7%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D9%88%D8%A7%D8%AF%20%20%D9%88%D8%A7%D8%AC%D9%88%D8%B1%20%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D9%84%D9%8A%D9%86%D8%A9.pdf"
        }
      ]
    }
  }
};
