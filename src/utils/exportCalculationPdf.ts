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

function humanize(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, char => char.toUpperCase());
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'number') return Number.isFinite(value) ? String(Number(value.toFixed(3))) : '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function rowsFor(value: unknown, prefix = ''): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return value.map((entry, index) => {
      const heading = prefix ? `${prefix} ${index + 1}` : `Item ${index + 1}`;
      if (entry && typeof entry === 'object') {
        return `<tr class="group"><th colspan="2">${escapeHtml(heading)}</th></tr>${rowsFor(entry, '')}`;
      }
      return `<tr><td>${escapeHtml(heading)}</td><td>${escapeHtml(displayValue(entry))}</td></tr>`;
    }).join('');
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).map(([key, entry]) => {
      if (entry && typeof entry === 'object') {
        return `<tr class="group"><th colspan="2">${escapeHtml(humanize(key))}</th></tr>${rowsFor(entry, humanize(key))}`;
      }
      return `<tr><td>${escapeHtml(humanize(key))}</td><td>${escapeHtml(displayValue(entry))}</td></tr>`;
    }).join('');
  }
  return `<tr><td>${escapeHtml(prefix || 'Value')}</td><td>${escapeHtml(displayValue(value))}</td></tr>`;
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
      <h3>${escapeHtml(copy.inputs)}</h3><table>${rowsFor(inputs) || `<tr><td colspan="2" class="empty">—</td></tr>`}</table>
      <h3>${escapeHtml(copy.results)}</h3><table>${result === null || result === undefined ? `<tr><td colspan="2" class="empty">${escapeHtml(copy.empty)}</td></tr>` : rowsFor(result)}</table>
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
