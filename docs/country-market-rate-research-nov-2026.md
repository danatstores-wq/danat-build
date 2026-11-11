# Danat Build — Country Construction Market Rate Research

**Research date:** 11 November 2026  
**Markets:** Lebanon (primary, USD display), United Arab Emirates (AED), Saudi Arabia (SAR), Qatar (QAR), Kuwait (KWD), Oman (OMR)

## Executive decision

The country selector and editable local-market rate catalog are implemented. A complete and defensible six-country price book for every Danat Build bill-of-quantities line is **not yet available from public evidence**. Do not prefill GCC prices by copying Lebanon rates, applying exchange rates, or applying one country-wide multiplier.

Lebanon retains its existing USD defaults. GCC markets have separate saved rate inputs that start blank rather than inheriting Lebanon prices. The calculator can show a partial total for manually priced active items and flags missing required rates; a complete GCC estimate still requires country-specific item-level defaults, review and validation.

## Comparable published benchmarks

These are reference points, not a complete project rate schedule. Units, specifications, tax treatment, date and procurement scale must be checked before using them as app defaults.

### Lebanon — USD

- Etimadco's Lebanon material index describes a rolling 30-day median based on actual supplier-platform prices, RFQs and user corrections for rebar, cement, ready-mix concrete, blocks and sand. It states that a figure appears after at least five samples from three different sources. The index is in LBP, not USD; the app's Lebanon USD estimates therefore remain planning allowances and should not be represented as a direct export of this index.
- Current public evidence does not provide a complete, independently verifiable installed-rate schedule for all 16 Danat Build cost categories.

Sources:
- Etimadco Lebanon material index: https://etimadco.com/lb/services/material-prices

### United Arab Emirates — AED

**Dubai labor benchmarks (QS Mind, market day 9 November 2026):**
- Formwork carpenter: AED 206/day, 9-hour day.
- Plasterer: AED 164/day, 8-hour day.
- Electrician: AED 208/day, 8-hour day.
- Plumber: AED 190/day, 8-hour day.
- Painter: AED 150/day, 8-hour day.
- Helper: AED 12.50/hour.
- Skilled tradesman: AED 17.50/hour.

The listed manpower rates include visa, accommodation and transport by the supplier; overtime is excluded. These are labor-supply rates, not installed BOQ rates.

**Historical cross-check (AECOM Middle East Property & Construction Handbook 2024; labor observations Q3 2023):** Dubai skilled operatives were listed at USD 6.00/hour for concreters and steel fixers, USD 6.50/hour for bricklayers and carpenters, and USD 9.00/hour for electricians. AECOM describes these as all-in employment-cost benchmarks including recruitment, visas, leave, travel, accommodation and welfare, but excluding overtime, contractor overhead/profit and VAT. These are historical reference values only; the newer QS Mind market-day rates above take precedence for current planning.

**Material reference (Turner & Townsend, UAE market intelligence 2025):**
- 30 MPa ready-mix concrete: AED 300/m³ in Dubai and AED 325/m³ in Abu Dhabi, for a 1,500 m³ job.
- 16 mm reinforcement bar: AED 2,900/t Dubai and AED 2,940/t Abu Dhabi, for a 120 t job.
- 100 mm solid concrete block: AED 3,250/1,000 Dubai and AED 4,000/1,000 Abu Dhabi, for schemes above 10,000 blocks.
- 13 mm plasterboard: AED 20/m² Dubai and AED 22/m² Abu Dhabi.

The procurement quantities are large and the source is 2025; do not treat these as small-residential-project quotations.

**Additional measured-work references (Turner & Townsend, 2025):**
- Footing excavation: AED 25/m³ Dubai.
- Beam reinforcement measured/installed: AED 5,000/t Dubai (not the supply-only rebar rate).
- 200 mm solid-block wall: AED 180/m² Dubai.
- Standard ceramic floor tiles: AED 150/m² Dubai.
- Single solid-core door with frame and hardware: AED 4,000 each Dubai.

These are measured rates from larger projects and should not be treated as small-villa quotations.

Sources:
- QS Mind Dubai labor: https://prices.qsmind.app/en/uae/labour
- Turner & Townsend UAE market intelligence 2025: https://marketintelligence.turnerandtownsend.com/uaemi-2025/construction-cost-performance
- SIBRIS UAE rates (itemized marketplace; verify each listing and coverage): https://rates.sibris.ae/

### Saudi Arabia — SAR

**National material averages (GASTAT, latest published month September 2026):**
- Black national cement: SAR 15.53 per 50 kg.
- 15 cm black block: SAR 1,677.78 per 1,000.
- 20 cm black block: SAR 1,736.82 per 1,000.
- National marble tiles: SAR 23.16/m².
- White soft sand: SAR 77.61/m³.
- Mixed sand: SAR 53.21/m³.

The same data source reports official national averages for 37 material specifications. These are material prices, not installed rates.

**Riyadh installed-work / manpower references (QS Mind, market day 10 November 2026):**
- Plaster mason manpower: SAR 15/hour.
- Plumber manpower: SAR 15/hour.
- Machine excavation in normal soil, including loading and spreading within site: SAR 21.50/m³.
- Internal cement plaster supply and apply: SAR 26/m².
- Structural frame with materials: SAR 613/m² of built-up area, with excavation and finishes excluded; specification and exclusions must be read before comparison.

**Additional installed-work references (QS Mind, Riyadh):**
- Machine excavation in normal soil: SAR 21.50/m³, including machine, fuel and operator; excludes rock and off-site disposal.
- Internal cement plaster supply and apply: SAR 26/m².
- Porcelain floor tiling supply and install: SAR 67.50/m².
- Internal emulsion painting supply and apply: SAR 22/m².
- 4 mm roof waterproofing membrane supply and install: SAR 35/m².
- Gypsum-board ceiling supply and install: SAR 82.50/m².
- Lighting point supply and install: SAR 85/point; socket point SAR 97.50/point.

These are Riyadh subcontract benchmarks with defined specifications. Installed prices must not be entered as material-only rates.

**Historical cross-check (AECOM 2024; Q3 2023 labor observations):** Riyadh skilled operatives were listed at USD 9.30/hour for concreters, USD 9.80/hour for steel fixers, USD 10.40/hour for bricklayers and carpenters, and USD 12.30/hour for electricians. These all-in employment-cost figures are historical and should not replace the newer Riyadh QS Mind observations.

Sources:
- GASTAT national material averages via iBuild: https://ibuild.sa/material-prices
- QS Mind Riyadh installed works: https://prices.qsmind.app/en/saudi/works
- GASTAT construction cost index coverage: https://www.stats.gov.sa/

### Qatar — QAR

**Ashghal published material-price schedule:**
- Reinforcement steel 8 mm: QAR 3,125/t for June 2026.
- Reinforcement steel 10–40 mm: QAR 2,990/t for June 2026.
- Bitumen 60/70: QAR 2,925/t for November 2026.

Ashghal's price list gives validity dates; do not substitute a past-month price for a current quotation without a refresh.

**Additional indicative market listings (BoqCalc, updated 11 November 2026):**
- Ready-mix C25/30: QAR 270/m³.
- Ready-mix C30/37: QAR 305/m³.
- Sand 0–4 mm: QAR 72/m³.
- Concrete worker: QAR 37.42/hour.

BoqCalc is a commercial pricing source, not an official authority. Use as a cross-check only until supported by supplier quotations or a quantity-surveyor schedule.

**Historical cross-check (AECOM 2024; Q3 2023 labor observations):** Doha skilled operatives were listed at USD 6.30/hour for concreters and steel fixers, USD 8.00/hour for bricklayers and carpenters, and USD 9.30/hour for electricians. These are all-in employment-cost references, not subcontract charge-out rates.

**2025 procurement reference (Turner & Townsend):**
- 30 MPa concrete: QAR 340/m³ for a 1,500 m³ job.
- 16 mm reinforcement: QAR 2,900/t for a 120 t job.
- 100 mm concrete block: QAR 3,250/1,000 for schemes above 10,000 blocks.

Differences between these values and smaller-job listings likely reflect specification, date, procurement scale and source methodology; do not average them blindly.

**Additional illustrative BOQ references (Qatar quantity-surveying provider):**
- Ordinary soil excavation: QAR 28/m³.
- C15 blinding concrete: QAR 310/m³.
- C35 reinforced foundation concrete: QAR 395/m³.
- 200 mm hollow blockwork: QAR 62/m².
- 15 mm internal cement plaster: QAR 34/m².
- Porcelain floor tiling: QAR 145/m².
- Two-coat emulsion paint: QAR 16/m².

These are sample BOQ rates, not a government tariff or a guarantee of current contractor pricing. Scope and procurement quantities vary.

Sources:
- Ashghal price list: https://www.ashghal.gov.qa/en/Services/Pages/PriceList.aspx
- Qatar sample quantity-surveying BOQ: https://www.carbonblueglobal.com/services/quantity-surveying
- BoqCalc Qatar: https://boqcalc.com/countries/qatar
- Turner & Townsend Qatar market intelligence 2025: https://marketintelligence.turnerandtownsend.com/qatar-mi-2025/construction-cost-performance

### Kuwait — KWD

**Material index (GCCPricing, refreshed on a 14-day cycle):**
- Average deformed rebar Y8–Y32: KWD 245/t.
- Average OPC/SRC cement: KWD 3 per 50 kg bag.
- The Kuwait hub displays 40+ monitored construction-material categories, including sanitaryware, pumps, plumbing, electrical, waterproofing, flooring, doors/windows and landscaping. Individual item specifications and delivery terms still need checking before use as a residential rate.

Etimadco also describes a Kuwait rolling 30-day median for rebar, cement, ready-mix concrete, blocks and sand based on actual supplier-platform prices and RFQs, with a minimum sample threshold. The accessible public page does not expose a full item-by-item rate table in the retrieved view.

**Whole-project cross-check (Al Qabas, 16 February 2026, quoting Al-Hisba annual report):**
- Average-quality residential construction and finishing: approximately KWD 135/m².
- Good quality: approximately KWD 161/m².
- Very good quality: approximately KWD 198/m².
- High quality (not luxury): approximately KWD 255/m².

These are whole-project benchmarks for a stated house configuration and finish levels, not unit rates for Danat Build's BOQ. They cannot be used to price individual trades without a matching scope breakdown.

**Construction trade wage references (Taj HR Services, data period Oct 2025–Sep 2026; updated 21 September 2026):** electrician basic median KWD 185/month (range 150–250), formwork carpenter KWD 180/month (150–260), and plumber KWD 170/month (140–230). These are overseas-intake basic wages; housing, transport, food, overtime and contractor employment costs are separate. They are not hourly charge-out rates.

Sources:
- GCCPricing Kuwait: https://www.gccpricing.com/kuwait-construction-prices
- Taj HR Services Kuwait 2026 salary guide: https://tajhrservices.com/salary-guide/kuwait
- AECOM Middle East Property & Construction Handbook 2024: https://publications.aecom.com/MEH/static/69a84a66cc94f48d41d456bfc959f519/4714f9cc02b32c869d15d7378fcb142e.pdf
- Etimadco Kuwait index: https://etimadco.com/kw/services/material-prices
- Al Qabas / Al-Hisba annual report summary: https://www.alqabas.com/

### Oman — OMR

**Material index (GCCPricing, refreshed on a 14-day cycle):**
- Average deformed rebar Y8–Y32: OMR 307/t.
- Average OPC/SRC cement: OMR 3 per 50 kg bag.
- The Oman hub displays 40+ monitored material categories, including MEP, sanitaryware, waterproofing, finishes, doors/windows and landscaping.

**Local block manufacturer (Al Madina Cement Products):**
- Regular 20 cm hollow block: OMR 0.165–0.175/piece, depending on delivery area.
- 20 cm solid block: OMR 0.210–0.220/piece, depending on delivery area.

**Construction trade wage references (Taj HR Services, data period Oct 2025–Sep 2026; updated 21 September 2026):** electrician basic median OMR 210/month (range 180–280), plumber OMR 190/month (160–260), and formwork carpenter OMR 190/month (160–270). These are overseas-intake basic wages; housing, transport, food, overtime and employer costs are separate. They are not contractor charge-out rates.

**Oman labor planning lead (EngiCore, 25 April 2026):** daily ranges listed are OMR 4–6 for general labor, OMR 8–12 for masons/carpenters/steel fixers, and OMR 10–15 for electricians/plumbers. This is a commercial estimating guide, not an official wage schedule; treat as provisional and verify against local subcontractor quotations.

Oman's Consumer Protection Authority reported in May 2026 that iron prices had increased 12% and cement 18% over February–May 2026, and advised checking current supplier prices. This reinforces the need to date-stamp and refresh rates.

Golden Muscat lists local material price-list categories by governorate and date, but explicitly says its information is informational and does not guarantee accuracy or completeness. It is a lead for supplier verification, not a rate authority.

Sources:
- GCCPricing Oman: https://www.gccpricing.com/oman-construction-prices
- Taj HR Services Oman 2026 salary guide: https://tajhrservices.com/salary-guide/oman
- AECOM Middle East Property & Construction Handbook 2024: https://publications.aecom.com/MEH/static/69a84a66cc94f48d41d456bfc959f519/4714f9cc02b32c869d15d7378fcb142e.pdf
- Al Madina Cement Products block prices: https://www.mcp.om/en/cement-blocks
- EngiCore Oman construction cost guide: https://engicore-9478b.web.app/blog-construction-cost-oman.html
- Golden Muscat price lists: https://www.goldenmuscat.com/price-lists/building-materials/
- Oman Consumer Protection Authority (May 2026 statement): https://cpa.gov.om/

## Cross-market source-quality assessment

| Market | Useful evidence found | Main limitation | App decision |
|---|---|---|---|
| Lebanon | Rolling supplier-derived index for core materials; existing USD planning allowances | Index is LBP and only covers five core materials; many app rates remain provisional | Keep Lebanon active; label defaults as planning allowances |
| UAE | Recent Dubai manpower rates; 2025 T&T material benchmarks | Dubai vs Abu Dhabi variation; large-project procurement quantities; incomplete trades | Do not activate a complete total yet |
| Saudi Arabia | Official GASTAT national material averages; recent Riyadh QS labor and installed rates | National materials and Riyadh installed rates have different geographic coverage | Build a separate Saudi profile after mapping all BOQ lines |
| Qatar | Ashghal dated material schedule; current commercial material and labor listings; 2025 T&T benchmarks | Current installed labor/finishes coverage incomplete; mixed source quality | Build a separate Qatar profile after validation |
| Kuwait | 40+ category material index; whole-house cost-per-m² study; rolling material index description | Missing sufficiently detailed public labor and installed-trade rates | Keep totals incomplete until labor/installed coverage is built |
| Oman | 40+ category material index; local block manufacturer rates; provisional trade wage guide | Wage guide is not official and installed-trade coverage remains incomplete | Keep totals incomplete until labor/installed coverage is validated |

## Requirements before enabling a country profile

1. Price every active catalogue item in its local currency and the exact app unit (m³, m², kg, m, bag, piece, set or job).
2. Separate material/service and labor amounts. Do not double-count labor embedded in an installed rate.
3. Record specification, source, geographic coverage, observation date, VAT inclusion/exclusion, procurement scale and confidence.
4. Mark every rate as one of: official/statistical, supplier quote/listing, QS/contractor benchmark, or provisional allowance.
5. Where no defensible rate exists, leave the line unpriced and keep the total incomplete; do not silently fill it with a Lebanon rate or currency conversion.
6. Confirm whether VAT, transport, equipment, contractor overhead/profit, permits and site preliminaries are included.
7. Revalidate all rates before release and refresh volatile materials at least monthly.

## Current implementation state

- Country selector supports Lebanon (USD), UAE (AED), Saudi Arabia (SAR), Qatar (QAR), Kuwait (KWD) and Oman (OMR).
- Lebanon defaults are unchanged.
- Each GCC market has an independent itemized rate-input state. Switching countries preserves each market's edits.
- The detailed catalogue is visible in every market. The calculator can produce a partial total and flags active items with missing required material/service or labor rates.
- GCC material/service defaults now map the available source benchmarks to the relevant catalogue lines:
  - UAE: machine excavation, 30 MPa ready-mix concrete, 16 mm reinforcement, 100 mm solid block material (converted to m²) and 50 kg cement.
  - Saudi Arabia: machine excavation, 350K normal concrete, 12 mm reinforcement, 15 cm block material (converted to m²), 50 kg cement and soft sand.
  - Qatar: ordinary soil excavation, C30/37 ready-mix concrete, reinforcement, 50 kg cement and sand.
  - Kuwait: reinforcement and 50 kg cement.
  - Oman: C25–C40 ready-mix concrete, reinforcement, 20 cm hollow block material (converted to m²) and 50 kg cement.
- Block material conversions assume a 400 × 200 mm face module (12.5 blocks/m²); mortar and installation labor are separate and are not included in those block rates.
- Concrete, reinforcement and block defaults are **material-only**. Their labor fields remain zero and active quantities therefore continue to be flagged until a local labor rate is entered. The excavation entries are measured machine/service rates where the source includes machine/operator; the app stores them in the service/material column because the catalogue line does not require a separate labor amount.
- The rates are reference anchors, not a complete installed price book. In particular, the same published concrete benchmark is currently used as a planning material anchor across the structural concrete lines; actual grade, mix design, pump, delivery distance and project volume must be confirmed before quotation.
- Published market benchmarks remain displayed separately from editable itemized rates. They are not silently treated as installed rates.

**Remaining work:** extend the country rate cards to more catalogue materials and independently sourced labor rates; add per-rate provenance and confidence labels in the editable itemized section; review composite/installed work items so material and labor are not double-counted; then run type/build validation and calculation checks for all six markets. Keep totals incomplete wherever an active line lacks a required rate.
