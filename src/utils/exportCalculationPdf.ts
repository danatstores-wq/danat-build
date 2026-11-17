import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LocalProject, SavedCalculation } from '../storage/localProjects';

type Language = 'en' | 'ar' | 'fr';

const labels = {
  en: { report: 'DANAT BUILD — CALCULATION REPORT', project: 'Project', calculation: 'Calculation', saved: 'Saved on', inputs: 'Inputs and specifications', results: 'Results', empty: 'No calculation result was saved.', disclaimer: 'Preliminary estimate only. Verify quantities, specifications and prices with qualified professionals and local quotations.' },
  ar: { report: 'دانات بيلد — تقرير الحساب', project: 'المشروع', calculation: 'الحساب', saved: 'تاريخ الحفظ', inputs: 'المدخلات والمواصفات', results: 'النتائج', empty: 'لم يتم حفظ نتيجة للحساب.', disclaimer: 'هذا تقدير أولي فقط. يرجى التحقق من الكميات والمواصفات والأسعار مع المختصين وعروض الأسعار المحلية.' },
  fr: { report: 'DANAT BUILD — RAPPORT DE CALCUL', project: 'Projet', calculation: 'Calcul', saved: 'Enregistré le', inputs: 'Données et spécifications', results: 'Résultats', empty: 'Aucun résultat de calcul enregistré.', disclaimer: 'Estimation préliminaire uniquement. Vérifiez les quantités, spécifications et prix auprès de professionnels qualifiés et avec des devis locaux.' },
};

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return value.replace(/[&<>"']/g, char => entities[char] || char);
}

const fieldTranslations: Record<string, [string, string]> = {
  selectedCountry: ['الدولة', 'Pays'], selectedCurrency: ['العملة', 'Devise'], units: ['وحدات القياس', 'Unités'],
  floors: ['الطوابق', 'Étages'], values: ['المواصفات الهندسية', 'Spécifications techniques'], detailedValues: ['تكاليف البنود التفصيلية', 'Coûts détaillés par poste'],
  id: ['المعرّف', 'Identifiant'], length: ['الطول', 'Longueur'], width: ['العرض', 'Largeur'], height: ['الارتفاع', 'Hauteur'],
  openings: ['مساحة الأبواب والنوافذ', 'Surface des portes et fenêtres'], partitions: ['مساحة القواطع الداخلية', 'Surface des cloisons intérieures'],
  footingCount: ['عدد القواعد', 'Nombre de semelles'], footingLength: ['طول القاعدة', 'Longueur de semelle'], footingWidth: ['عرض القاعدة', 'Largeur de semelle'], footingDepth: ['عمق القاعدة', 'Profondeur de semelle'],
  excavationDepth: ['عمق الحفر', 'Profondeur d’excavation'], columnCount: ['عدد الأعمدة', 'Nombre de poteaux'], columnWidth: ['عرض العمود', 'Largeur du poteau'], columnDepth: ['عمق العمود', 'Profondeur du poteau'],
  beamLength: ['إجمالي طول الجسور', 'Longueur totale des poutres'], beamWidth: ['عرض الجسر', 'Largeur de poutre'], beamDepth: ['عمق الجسر', 'Profondeur de poutre'],
  slabThickness: ['سماكة البلاطة', 'Épaisseur de dalle'], stairVolume: ['حجم باطون الدرج', 'Volume de béton des escaliers'],
  blockLength: ['طول البلوك', 'Longueur du bloc'], blockHeight: ['ارتفاع البلوك', 'Hauteur du bloc'], paintCoats: ['عدد طبقات الدهان', 'Couches de peinture'], paintCoverage: ['تغطية الدهان', 'Couverture peinture'], tileWaste: ['نسبة هدر البلاط', 'Pertes de carrelage'], waterproof: ['مساحة عزل السطح', 'Surface d’étanchéité du toit'],
  equipment: ['تكلفة المعدات', 'Coût de l’équipement'], extra: ['تكاليف أخرى', 'Autres coûts'], contingency: ['نسبة الاحتياطي', 'Provision pour imprévus'],
  floorArea: ['إجمالي مساحة الطوابق', 'Surface totale des étages'], excavation: ['حفر الأساسات', 'Excavation des fondations'], concrete: ['باطون الهيكل الإنشائي', 'Béton structurel'],
  blocks: ['عدد البلوك المطلوب', 'Blocs nécessaires'], netWallArea: ['مساحة الجدران الصافية', 'Surface nette des murs'], wallArea: ['مساحة الجدران الصافية', 'Surface nette des murs'],
  plasterArea: ['مساحة قصارة الجدران', 'Surface des murs à enduire'], tileArea: ['مساحة البلاط مع الهدر', 'Carrelage avec pertes'], paintLitres: ['كمية الدهان المطلوبة', 'Peinture nécessaire'],
  waterproofArea: ['مساحة العزل', 'Surface d’étanchéité'], electricalPoints: ['نقاط الكهرباء', 'Points électriques'], plumbingPoints: ['نقاط السباكة', 'Points de plomberie'],
  materialTotal: ['تقدير المواد والخدمات', 'Estimation matériaux et services'], labor: ['العمالة', 'Main-d’œuvre'], laborResult: ['العمالة', 'Main-d’œuvre'],
  equipmentResult: ['المعدات', 'Équipement'], extraResult: ['تكاليف أخرى', 'Autres coûts'], subtotal: ['المجموع الفرعي', 'Sous-total'],
  reserve: ['الاحتياطي', 'Imprévus'], total: ['التكلفة الإجمالية التقديرية', 'Coût total estimé'], totalCost: ['التكلفة الإجمالية', 'Coût total'],
  categoryTotals: ['إجمالي الأقسام', 'Totaux par catégorie'], unpricedItemCount: ['عدد البنود غير المسعّرة', 'Nombre de postes non chiffrés'],
  benchmarkSnapshot: ['مرجع أسعار السوق', 'Référence des prix du marché'], version: ['الإصدار', 'Version'], publishedAt: ['تاريخ النشر', 'Date de publication'],
  currency: ['العملة', 'Devise'], benchmarks: ['مؤشرات الأسعار', 'Repères de prix'], value: ['القيمة', 'Valeur'], item: ['البند', 'Poste'], note: ['ملاحظة', 'Note'],
  quantity: ['الكمية', 'Quantité'], result: ['النتائج', 'Résultats'], resultTotal: ['الإجمالي', 'Total'],
};
const countryTranslations: Record<string, [string, string]> = {
  LB: ['لبنان', 'Liban'], AE: ['الإمارات العربية المتحدة', 'Émirats arabes unis'], SA: ['السعودية', 'Arabie saoudite'],
  QA: ['قطر', 'Qatar'], KW: ['الكويت', 'Koweït'], OM: ['عُمان', 'Oman'], BH: ['البحرين', 'Bahreïn'], EG: ['مصر', 'Égypte'], IQ: ['العراق', 'Irak'],
};
const costItemTranslations: Record<string, [string, string]> = {
  excavation: ['حفر التربة', 'Excavation'], soilRemoval: ['نقل وترحيل الأتربة', 'Évacuation des terres'], backfilling: ['ردم التربة', 'Remblayage'], soilCompaction: ['دك التربة', 'Compactage du sol'], sitePreparation: ['تجهيز الموقع', 'Préparation du chantier'],
  leanConcrete: ['خرسانة النظافة', 'Béton de propreté'], footingConcrete: ['خرسانة القواعد', 'Béton des semelles'], foundationSteel: ['حديد تسليح الأساسات', 'Acier des fondations'], foundationFormwork: ['قوالب الأساسات', 'Coffrage des fondations'], foundationWaterproofing: ['عزل الأساسات', 'Étanchéité des fondations'],
  columnConcrete: ['خرسانة الأعمدة', 'Béton des poteaux'], stairConcrete: ['خرسانة الدرج', 'Béton des escaliers'], beamConcrete: ['خرسانة الجسور', 'Béton des poutres'], slabConcrete: ['خرسانة الأسقف', 'Béton des dalles'], structuralSteel: ['حديد التسليح الإنشائي', 'Acier de structure'],
  columnFormwork: ['قوالب الأعمدة', 'Coffrage des poteaux'], beamFormwork: ['قوالب الجسور', 'Coffrage des poutres'], slabFormwork: ['قوالب الأسقف', 'Coffrage des dalles'], scaffolding: ['السقالات والدعائم', 'Échafaudages et étais'],
  externalBlocks: ['بلوك الجدران الخارجية', 'Blocs des murs extérieurs'], internalBlocks: ['بلوك القواطع الداخلية', 'Blocs des cloisons intérieures'], cementMasonry: ['إسمنت البناء', 'Ciment de maçonnerie'], sandMasonry: ['رمل البناء', 'Sable de maçonnerie'], lintels: ['عتبات الأبواب والنوافذ', 'Linteaux des portes et fenêtres'],
  roofThermalInsulation: ['العزل الحراري', 'Isolation thermique'], roofWaterproofing: ['عزل السطح المائي', 'Membrane d’étanchéité'], roofScreed: ['ميول وتسوية السطح', 'Chape de toiture'], roofProtection: ['طبقة حماية العزل', 'Couche de protection'], roofDrainage: ['مصارف مياه السطح', 'Évacuations de toiture'],
  internalPlaster: ['قصارة داخلية', 'Enduit intérieur'], externalPlaster: ['قصارة خارجية', 'Enduit extérieur'], ceilingPlaster: ['قصارة الأسقف', 'Enduit de plafond'], plasterMesh: ['شبك القصارة', 'Treillis pour enduit'], plasterMaterials: ['إسمنت ورمل القصارة', 'Ciment et sable pour enduit'],
  lightingPoints: ['نقاط إنارة', 'Points lumineux'], singleSockets: ['مآخذ كهرباء مفردة', 'Prises simples'], doubleSockets: ['مآخذ كهرباء مزدوجة', 'Prises doubles'], acPoints: ['نقاط المكيفات', 'Points de climatisation'], waterHeaterPoints: ['نقاط سخانات المياه', 'Points chauffe-eau'], tvPoints: ['نقاط التلفاز', 'Prises TV'], internetPoints: ['نقاط الإنترنت', 'Prises Internet'], switchPoints: ['مفاتيح ونقاط تحكم', 'Interrupteurs et commandes'], distributionBoard: ['لوحة التوزيع الكهربائية', 'Tableau électrique'], electricalCables: ['كابلات كهربائية', 'Câbles électriques'], electricalConduits: ['مواسير كهربائية', 'Conduits électriques'], grounding: ['نظام التأريض', 'Système de mise à la terre'],
  coldWaterPoints: ['نقاط مياه باردة', 'Points d’eau froide'], hotWaterPoints: ['نقاط مياه ساخنة', 'Points d’eau chaude'], toiletConnections: ['توصيلات المرحاض', 'Raccordements WC'], showerConnections: ['توصيلات الدش', 'Raccordements douche'], basinConnections: ['توصيلات المغاسل', 'Raccordements lavabo'], kitchenConnections: ['توصيلات حوض المطبخ', 'Raccordements évier cuisine'], drainagePipes: ['أنابيب الصرف الصحي', 'Tuyaux d’évacuation'], waterPipes: ['أنابيب تغذية المياه', 'Tuyaux d’alimentation en eau'], waterTank: ['خزان مياه', 'Réservoir d’eau'], waterPump: ['مضخة مياه', 'Pompe à eau'],
  toilets: ['مراحيض', 'Toilettes'], washBasins: ['مغاسل', 'Lavabos'], showers: ['أطقم دش', 'Ensembles de douche'], faucets: ['حنفيات وخلاطات', 'Robinets et mitigeurs'], sanitaryAccessories: ['إكسسوارات صحية', 'Accessoires sanitaires'],
  elevatorCabin: ['كابينة المصعد', 'Cabine d’ascenseur'], elevatorMotor: ['محرك المصعد', 'Moteur d’ascenseur'], elevatorController: ['لوحة تحكم المصعد', 'Contrôleur d’ascenseur'], elevatorRails: ['سكك التوجيه والحمالات', 'Rails de guidage et supports'], elevatorLandingDoors: ['أبواب الطوابق', 'Portes palières'], elevatorCables: ['كوابل وحبال المصعد', 'Câbles et cordes'], elevatorSafety: ['نظام السلامة والطوارئ', 'Système de sécurité et urgence'], elevatorInstallation: ['تركيب وفحص المصعد', 'Installation et essais'],
  floorTiles: ['بلاط الأرضيات', 'Carrelage de sol'], wallTiles: ['بلاط الجدران', 'Carrelage mural'], tileAdhesive: ['لاصق البلاط', 'Colle à carrelage'], tileGrout: ['روبة البلاط', 'Joint de carrelage'], skirting: ['وزرات البلاط', 'Plinthes carrelées'],
  internalDoors: ['أبواب داخلية', 'Portes intérieures'], externalDoors: ['أبواب خارجية', 'Portes extérieures'], aluminumWindows: ['نوافذ ألمنيوم', 'Fenêtres en aluminium'], glassWork: ['أعمال الزجاج', 'Vitrage'], doorHardware: ['أقفال وإكسسوارات الأبواب', 'Serrures et quincaillerie'],
  wallPrimer: ['وجه أساس للجدران', 'Primaire mural'], wallPutty: ['معجون وتجهيز الجدران', 'Enduit de préparation'], interiorPaint: ['دهان داخلي', 'Peinture intérieure'], exteriorPaint: ['دهان خارجي', 'Peinture extérieure'], metalWoodPaint: ['دهان المعادن والخشب', 'Peinture métal et bois'],
  falseCeiling: ['سقف مستعار', 'Faux plafond'], ceilingFrame: ['هيكل السقف المستعار', 'Ossature de plafond'], ceilingInsulation: ['عزل الأسقف', 'Isolation du plafond'], ceilingAccessPanels: ['فتحات صيانة السقف', 'Trappes de visite'], ceilingFinishing: ['تشطيب الأسقف', 'Finition des plafonds'],
  facadeFinish: ['تشطيب وكسوة الواجهة', 'Finition et revêtement façade'], externalPaving: ['تبليط خارجي', 'Pavage extérieur'], balustrades: ['درابزين الشرفات', 'Garde-corps des balcons'], externalStairs: ['درج خارجي', 'Escaliers extérieurs'], landscaping: ['تنسيق الموقع والأعمال الخارجية', 'Aménagement paysager'],
  transport: ['نقل المواد', 'Transport des matériaux'], wasteDisposal: ['ترحيل مخلفات البناء', 'Évacuation des déchets'], permits: ['رخص وفحوصات', 'Permis et inspections'], siteManagement: ['إدارة الموقع', 'Gestion du chantier'], miscellaneous: ['مصاريف متنوعة', 'Dépenses diverses'],
};
const categoryTranslations: Record<string, [string, string]> = {
  earthworks: ['الأعمال الترابية', 'Terrassement'], foundation: ['الأساسات', 'Fondations'], structure: ['الأعمال الإنشائية', 'Gros œuvre'],
  masonry: ['أعمال البناء', 'Maçonnerie'], roofing: ['الأسطح والعزل', 'Toiture et isolation'], plaster: ['القصارة', 'Enduits'],
  electrical: ['الأعمال الكهربائية', 'Électricité'], plumbing: ['التمديدات الصحية', 'Plomberie'], sanitary: ['الأدوات الصحية', 'Équipements sanitaires'],
  elevator: ['المصعد', 'Ascenseur'], tiling: ['البلاط والأرضيات', 'Carrelage et sols'], openings: ['الأبواب والنوافذ', 'Portes et fenêtres'],
  painting: ['الدهان', 'Peinture'], ceiling: ['الأسقف المستعارة', 'Plafonds'], facade: ['الواجهات والأعمال الخارجية', 'Façade et extérieurs'], other: ['مصاريف أخرى', 'Autres dépenses'],
};
function translatedKey(key: string, language: Language): string {
  if (language === 'en') return humanize(key);
  const langIndex = language === 'ar' ? 0 : 1;
  if (fieldTranslations[key]) return fieldTranslations[key][langIndex];
  if (categoryTranslations[key]) return categoryTranslations[key][langIndex];
  if (costItemTranslations[key]) return costItemTranslations[key][langIndex];
  const detailedMatch = key.match(/^(.+?)(Qty|Material|Labor)$/);
  if (detailedMatch && costItemTranslations[detailedMatch[1]]) {
    const suffix = detailedMatch[2] === 'Qty' ? (language === 'ar' ? 'الكمية' : 'Quantité')
      : detailedMatch[2] === 'Material' ? (language === 'ar' ? 'سعر المواد/الخدمة' : 'Prix matériau/service')
      : (language === 'ar' ? 'أجرة العمل' : 'Coût de main-d’œuvre');
    return `${costItemTranslations[detailedMatch[1]][langIndex]} — ${suffix}`;
  }
  return humanize(key);
}
function displayValue(value: unknown, language: Language, key = ''): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return Number.isFinite(value) ? String(Number(value.toFixed(3))) : '—';
  if (typeof value === 'boolean') return value ? (language === 'ar' ? 'نعم' : language === 'fr' ? 'Oui' : 'Yes') : (language === 'ar' ? 'لا' : language === 'fr' ? 'Non' : 'No');
  if (typeof value === 'string') {
    if (key === 'selectedCountry' && countryTranslations[value]) return countryTranslations[value][language === 'ar' ? 0 : 1];
    if (key === 'units') return value === 'imperial' ? (language === 'ar' ? 'إمبراطوري' : 'Impérial') : (language === 'ar' ? 'متري' : 'Métrique');
    return value;
  }
  return String(value);
}
function humanize(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, char => char.toUpperCase());
}
function rowsFor(value: unknown, language: Language, prefix = ''): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return value.map((entry, index) => {
      const heading = prefix ? `${prefix} ${index + 1}` : (language === 'ar' ? `عنصر ${index + 1}` : language === 'fr' ? `Élément ${index + 1}` : `Item ${index + 1}`);
      if (entry && typeof entry === 'object') {
        return `<tr class="group"><th colspan="2">${escapeHtml(heading)}</th></tr>${rowsFor(entry, language, '')}`;
      }
      return `<tr><td>${escapeHtml(heading)}</td><td>${escapeHtml(displayValue(entry, language))}</td></tr>`;
    }).join('');
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
      const label = translatedKey(key, language);
      if (entry && typeof entry === 'object') {
        return `<tr class="group"><th colspan="2">${escapeHtml(label)}</th></tr>${rowsFor(entry, language, label)}`;
      }
      return `<tr><td>${escapeHtml(label)}</td><td>${escapeHtml(displayValue(entry, language, key))}</td></tr>`;
    }).join('');
  }
  return `<tr><td>${escapeHtml(prefix || (language === 'ar' ? 'القيمة' : language === 'fr' ? 'Valeur' : 'Value'))}</td><td>${escapeHtml(displayValue(value, language))}</td></tr>`;
}

function reportHtml(projectName: string, calculations: SavedCalculation[], language: Language): string {
  const copy = labels[language];
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const savedDates = calculations.map(item => new Date(item.savedAt).toLocaleString(language === 'ar' ? 'ar' : language === 'fr' ? 'fr-FR' : 'en'));
  const sections = calculations.map(calculation => {
    const payload = calculation.payload || {};
    const inputs = Object.fromEntries(Object.entries(payload).filter(([key]) => !['result', 'benchmarkSnapshot'].includes(key)));
    const result = payload.result;
    return `<section class="calculation"><h2>${escapeHtml(copy.calculation)}: ${escapeHtml(calculation.title)}</h2>
      <h3>${escapeHtml(copy.inputs)}</h3><table>${rowsFor(inputs, language) || `<tr><td colspan="2" class="empty">—</td></tr>`}</table>
      <h3>${escapeHtml(copy.results)}</h3><table>${result === null || result === undefined ? `<tr><td colspan="2" class="empty">${escapeHtml(copy.empty)}</td></tr>` : rowsFor(result, language)}</table>
    </section>`;
  }).join('');
  return `<!DOCTYPE html><html lang="${language}" dir="${direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(projectName)}</title><style>
    @page{size:A4;margin:18mm}*{box-sizing:border-box}body{font-family:"Noto Naskh Arabic","Noto Sans Arabic","Geeza Pro",Tahoma,Arial,sans-serif;color:#20252b;font-size:11px;line-height:1.65;margin:0;unicode-bidi:plaintext}
    header{border-bottom:3px solid #c99742;padding-bottom:12px;margin-bottom:18px}h1{font-size:19px;color:#28231b;margin:0 0 8px}h2{font-size:14px;color:#8b6425;margin:22px 0 8px;border-bottom:1px solid #e5d8c2;padding-bottom:5px}h3{font-size:12px;color:#8b6425;margin:12px 0 6px}
    .meta{display:flex;flex-wrap:wrap;gap:8px 24px;color:#555}.meta strong{color:#222}.calculation{page-break-inside:auto;margin-bottom:24px}.calculation+ .calculation{page-break-before:always}
    table{width:100%;border-collapse:collapse;page-break-inside:auto}tr{page-break-inside:avoid}td,th{padding:6px 8px;border-bottom:1px solid #e9e9e9;text-align:start;vertical-align:top;overflow-wrap:anywhere}td:first-child{width:55%;color:#555}.group th{background:#f5f0e7;color:#6c4e1d;font-weight:700;padding-top:8px}.empty{color:#777;font-style:italic}
    footer{margin-top:26px;padding-top:9px;border-top:1px solid #ddd;color:#666;font-size:9px;page-break-inside:avoid}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}thead{display:table-header-group}}
  </style></head><body><header><h1>${escapeHtml(copy.report)}</h1><div class="meta"><span><strong>${escapeHtml(copy.project)}:</strong> ${escapeHtml(projectName)}</span><span><strong>${escapeHtml(copy.calculation)}:</strong> ${calculations.length}</span><span><strong>${escapeHtml(copy.saved)}:</strong> ${escapeHtml(savedDates.join(' • '))}</span></div></header>
  ${sections}
  <footer>${escapeHtml(copy.disclaimer)}</footer></body></html>`;
}

async function printOrShareHtml(html: string, title: string): Promise<void> {
  if (Platform.OS === 'web') {
    // Expo Print's web implementation prints the current page, not the supplied
    // HTML string. Use a dedicated document so the PDF contains project data.
    if (typeof window === 'undefined') throw new Error('Browser printing is unavailable.');
    const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent)
      || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('Allow pop-ups to export the project PDF.');
    const mobilePrintControls = isIOS
      ? `<style>
          .mobile-pdf-toolbar{position:sticky;top:0;z-index:9999;display:flex;justify-content:center;padding:12px;background:#171c22;border-bottom:2px solid #c99742}
          .mobile-pdf-toolbar button{background:#c99742;color:#171717;border:0;border-radius:8px;padding:12px 20px;font-size:16px;font-weight:700}
          @media print{.mobile-pdf-toolbar{display:none}}
        </style><div class="mobile-pdf-toolbar"><button type="button" onclick="window.print()">Print / Save PDF</button></div>`
      : '';
    const reportDocument = isIOS ? html.replace('<body>', `<body>${mobilePrintControls}`) : html;
    printWindow.document.open();
    printWindow.document.write(reportDocument);
    printWindow.document.close();
    printWindow.document.title = title;
    printWindow.focus();
    if (!isIOS) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
    // iOS Safari requires a direct user gesture to reliably open print options.
    return;
  }

  const file = await Print.printToFileAsync({ html, width: 595, height: 842 });
  if (!file?.uri) throw new Error('PDF generation did not return a file URI.');
  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      dialogTitle: title,
      UTI: 'com.adobe.pdf',
    });
    return;
  }
  await Print.printAsync({ html });
}

export async function exportCalculationPdf(projectName: string, calculation: SavedCalculation, language: Language): Promise<void> {
  const html = reportHtml(projectName, [calculation], language);
  await printOrShareHtml(html, calculation.title);
}

export async function exportProjectPdf(project: LocalProject, language: Language): Promise<void> {
  if (!project.calculations.length) throw new Error('This project has no saved calculations to export.');
  const html = reportHtml(project.name, project.calculations, language);
  await printOrShareHtml(html, project.name);
}
