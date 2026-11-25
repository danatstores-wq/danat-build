import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { getAnnualProfessionalPackage, purchaseProfessionalPackage, restoreProfessionalPurchases, STORE_PURCHASES_ENABLED } from "../subscriptions/revenueCat";
import { getThemedStyles } from "../theme";

type Props = {
  language: "en" | "ar" | "fr";
  theme: "dark" | "light";
  active: boolean;
  onBack: () => void;
  onAccessRefresh: (access?: { active: boolean; expiresAt: number | null }) => Promise<void>;
};

const GOLD = "#E9B85D";

export default function SubscriptionScreen({ language, theme, active, onBack, onAccessRefresh }: Props) {
  const ui = getThemedStyles(styles, theme);
  const [annualPackage, setAnnualPackage] = useState<PurchasesPackage | null>(null);
  const [loadingPackage, setLoadingPackage] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const t = (en: string, ar: string, fr: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const loadPackage = useCallback(async () => {
    if (!STORE_PURCHASES_ENABLED) {
      setAnnualPackage(null);
      setLoadingPackage(false);
      return;
    }
    setLoadingPackage(true);
    setError("");
    try {
      setAnnualPackage(await getAnnualProfessionalPackage());
    } catch (e: any) {
      setAnnualPackage(null);
      setError(e?.message || t("Could not load the store product.", "تعذر تحميل منتج المتجر.", "Impossible de charger le produit du magasin."));
    } finally {
      setLoadingPackage(false);
    }
  }, [language]);

  useEffect(() => {
    loadPackage();
  }, [loadPackage]);

  const buy = async () => {
    if (!annualPackage || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const access = await purchaseProfessionalPackage(annualPackage);
      await onAccessRefresh(access);
      setMessage(t("Purchase completed. Professional access is being refreshed.", "تم الشراء. جارٍ تحديث صلاحية المحترف.", "Achat terminé. Actualisation de l’accès Professionnel."));
    } catch (e: any) {
      if (!e?.userCancelled) {
        setError(e?.message || t("The purchase could not be completed.", "تعذر إتمام عملية الشراء.", "L’achat n’a pas pu être effectué."));
      }
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const access = await restoreProfessionalPurchases();
      await onAccessRefresh(access);
      setMessage(t("Store purchases have been restored.", "تمت استعادة مشتريات المتجر.", "Les achats du magasin ont été restaurés."));
    } catch (e: any) {
      setError(e?.message || t("Could not restore purchases.", "تعذرت استعادة المشتريات.", "Impossible de restaurer les achats."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={ui.container}>
      <Text style={ui.brand}>DANAT BUILD</Text>
      <Text style={ui.heading}>
        {t("Professional Plan", "الخطة الاحترافية", "Offre Professionnelle")}
      </Text>

      <View style={ui.card}>
        <Text style={ui.price}>$10<Text style={ui.perYear}> / {t("year", "سنوياً", "an")}</Text></Text>
        <Text style={ui.description}>
          {t(
            "One year of full access. Renew manually whenever you choose. No automatic yearly renewal.",
            "سنة كاملة من الوصول. جدد يدوياً عندما ترغب. لا يوجد تجديد سنوي تلقائي.",
            "Une année d’accès complet. Renouvelez manuellement quand vous le souhaitez. Aucun renouvellement annuel automatique."
          )}
        </Text>
        <View style={ui.divider} />
        {[
          t("All Home Owner calculators", "جميع حاسبات مالك المنزل", "Tous les calculateurs Propriétaire"),
          t("Full Building Calculator", "حاسبة البناء الشاملة", "Calculateur complet du bâtiment"),
          t("All Professional tools", "جميع الأدوات الاحترافية", "Tous les outils professionnels"),
          t("No advertisements", "بدون إعلانات", "Sans publicité"),
          t("Access on Android and iOS with the same account", "الوصول على أندرويد وآيفون بالحساب نفسه", "Accès sur Android et iOS avec le même compte"),
        ].map((item, index) => <Text key={index} style={ui.feature}>✓  {item}</Text>)}
      </View>

      {active ? (
        <Text style={ui.success}>
          {t("Professional access is active on this account.", "الاشتراك الاحترافي فعال على هذا الحساب.", "L’accès Professionnel est actif sur ce compte.")}
        </Text>
      ) : null}

      {loadingPackage ? (
        <ActivityIndicator color={GOLD} style={ui.loader} />
      ) : annualPackage ? (
        <Pressable style={[ui.buyButton, busy && ui.disabled]} onPress={buy} disabled={busy}>
          {busy ? <ActivityIndicator color="#17110a" /> : (
            <Text style={ui.buyText}>
              {active
                ? t("RENEW FOR ONE YEAR", "تجديد لسنة واحدة", "RENOUVELER POUR UN AN")
                : t("BUY PROFESSIONAL — $10 / YEAR", "اشترِ المحترف — 10$ سنوياً", "ACHETER PRO — 10$ / AN")}
            </Text>
          )}
        </Pressable>
      ) : (
        <Text style={ui.notice}>
          {t(
            "Store checkout is temporarily unavailable. Secure purchase verification and refund handling must be enabled before payments can be accepted.",
            "الشراء عبر المتجر غير متاح مؤقتاً. يجب تفعيل التحقق الآمن من المشتريات ومعالجة المبالغ المستردة قبل قبول المدفوعات.",
            "Les achats sont temporairement indisponibles. La vérification sécurisée des achats et la gestion des remboursements doivent être activées avant d’accepter les paiements."
          )}
        </Text>
      )}

      {STORE_PURCHASES_ENABLED ? (
        <Pressable style={[ui.restoreButton, busy && ui.disabled]} onPress={restore} disabled={busy || loadingPackage}>
          <Text style={ui.restoreText}>{t("RESTORE PURCHASES", "استعادة المشتريات", "RESTAURER LES ACHATS")}</Text>
        </Pressable>
      ) : null}

      {!!error && <Text style={ui.error}>{error}</Text>}
      {!!message && <Text style={ui.success}>{message}</Text>}

      <Pressable style={ui.backButton} onPress={onBack}>
        <Text style={ui.backText}>{t("BACK", "رجوع", "RETOUR")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080B0E", padding: 22, alignItems: "center" },
  brand: { color: GOLD, fontSize: 13, fontWeight: "900", letterSpacing: 3, marginTop: 12 },
  heading: { color: "#fff", fontSize: 25, fontWeight: "800", marginTop: 20, marginBottom: 24, textAlign: "center" },
  card: { width: "100%", backgroundColor: "#191e24", borderWidth: 1, borderColor: "#66553a", borderRadius: 16, padding: 20 },
  price: { color: GOLD, fontSize: 38, fontWeight: "900", textAlign: "center" },
  perYear: { color: "#bbb", fontSize: 15, fontWeight: "600" },
  description: { color: "#ddd", fontSize: 13, textAlign: "center", lineHeight: 21, marginTop: 8 },
  divider: { height: 1, backgroundColor: "#39352d", marginVertical: 18 },
  feature: { color: "#f2f2f2", fontSize: 13, lineHeight: 22, marginBottom: 8 },
  notice: { color: "#e9c98c", fontSize: 12, textAlign: "center", marginTop: 20, lineHeight: 20, paddingHorizontal: 8 },
  success: { color: "#9fdaa9", fontSize: 12, textAlign: "center", marginTop: 16, lineHeight: 19 },
  error: { color: "#ff7777", fontSize: 12, textAlign: "center", marginTop: 14, lineHeight: 19 },
  loader: { marginTop: 20 },
  buyButton: { width: "100%", marginTop: 22, borderRadius: 12, backgroundColor: GOLD, paddingVertical: 15, paddingHorizontal: 12, alignItems: "center" },
  buyText: { color: "#17110a", fontSize: 12, fontWeight: "900", textAlign: "center" },
  restoreButton: { marginTop: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: GOLD, width: "100%", alignItems: "center" },
  restoreText: { color: GOLD, fontSize: 11, fontWeight: "900" },
  disabled: { opacity: 0.55 },
  backButton: { marginTop: 22, padding: 12 },
  backText: { color: "#bbb", fontWeight: "800", fontSize: 12 },
});
