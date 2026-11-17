import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { auth } from "../firebase";
import {
  configureRevenueCat,
  getAnnualProfessionalPackage,
  purchaseProfessionalPackage,
  restoreProfessionalPurchases,
} from "../subscriptions/revenueCat";
import type { PurchasesPackage } from "react-native-purchases";
import { getThemedStyles } from "../theme";

type Props = {
  language: "en" | "ar" | "fr";
  theme: "dark" | "light";
  active: boolean;
  onBack: () => void;
};

const GOLD = "#E9B85D";

export default function SubscriptionScreen({
  language,
  theme,
  active,
  onBack,
}: Props) {
  const ui = getThemedStyles(styles, theme);
  const [annualPackage, setAnnualPackage] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = (en: string, ar: string, fr: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("Please sign in to manage Professional access.");

        const configured = await configureRevenueCat(uid);
        if (!configured) {
          throw new Error(
            "In-app purchases are not configured yet. Store setup is still required."
          );
        }

        const item = await getAnnualProfessionalPackage();
        if (mounted) setAnnualPackage(item);
        if (!item && mounted) {
          setError("The annual Professional product is not available in the store yet.");
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || "Could not load the subscription.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  const buy = async () => {
    if (!annualPackage) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await purchaseProfessionalPackage(annualPackage);
      setMessage(t(
        "Purchase completed. Professional access will unlock after server verification.",
        "اكتملت عملية الشراء. سيتم تفعيل الميزات الاحترافية بعد التحقق من الخادم.",
        "Achat effectué. L’accès Professionnel sera activé après vérification du serveur."
      ));
    } catch (e: any) {
      setError(e?.message || "Purchase could not be completed.");
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await restoreProfessionalPurchases();
      setMessage(t(
        "Restore request completed. Your account access is being refreshed.",
        "اكتملت محاولة الاستعادة. جارٍ تحديث صلاحيات حسابك.",
        "La restauration est terminée. Les droits de votre compte sont actualisés."
      ));
    } catch (e: any) {
      setError(e?.message || "Purchases could not be restored.");
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
            "One year of full access. Renew manually whenever you choose.",
            "سنة كاملة من الوصول. جدد يدوياً عندما ترغب.",
            "Une année d’accès complet. Renouvelez manuellement quand vous le souhaitez."
          )}
        </Text>
        <View style={ui.divider} />
        {[
          t("All Home Owner calculators", "جميع حاسبات مالك المنزل", "Tous les calculateurs Propriétaire"),
          t("Full Building Calculator", "حاسبة البناء الشاملة", "Calculateur complet du bâtiment"),
          t("All Professional tools", "جميع الأدوات الاحترافية", "Tous les outils professionnels"),
          t("No advertisements", "بدون إعلانات", "Sans publicité"),
          t("Access on Android and iOS with the same account", "الوصول على أندرويد وآيفون بالحساب نفسه", "Accès sur Android et iOS avec le même compte"),
        ].map((item, index) => (
          <Text key={index} style={ui.feature}>✓  {item}</Text>
        ))}
      </View>

      {active ? (
        <Text style={ui.success}>
          {t("Professional access is active on this account.", "الاشتراك الاحترافي فعال على هذا الحساب.", "L’accès Professionnel est actif sur ce compte.")}
        </Text>
      ) : (
        <Pressable
          style={[ui.primaryButton, (!annualPackage || busy || loading) && ui.disabled]}
          onPress={buy}
          disabled={!annualPackage || busy || loading}
        >
          {busy
            ? <ActivityIndicator color="#17110a" />
            : <Text style={ui.primaryButtonText}>
                {annualPackage
                  ? t("SUBSCRIBE — $10 / YEAR", "اشترك — 10 دولارات سنوياً", "S’ABONNER — 10 $ / AN")
                  : t("STORE PRODUCT NOT READY", "المنتج غير جاهز في المتجر", "PRODUIT NON DISPONIBLE")}
              </Text>}
        </Pressable>
      )}

      <Pressable style={ui.secondaryButton} onPress={restore} disabled={busy || loading}>
        <Text style={ui.secondaryButtonText}>
          {t("RESTORE PURCHASES", "استعادة المشتريات", "RESTAURER LES ACHATS")}
        </Text>
      </Pressable>

      {loading && <ActivityIndicator color={GOLD} style={{ marginTop: 16 }} />}
      {!!message && <Text style={ui.success}>{message}</Text>}
      {!!error && <Text style={ui.error}>{error}</Text>}

      <Pressable style={ui.backButton} onPress={onBack}>
        <Text style={ui.backText}>{t("BACK", "رجوع", "RETOUR")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#080B0E",
    padding: 22,
    alignItems: "center",
  },
  brand: {
    color: GOLD,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 3,
    marginTop: 12,
  },
  heading: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "#191e24",
    borderWidth: 1,
    borderColor: "#66553a",
    borderRadius: 16,
    padding: 20,
  },
  price: {
    color: GOLD,
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
  },
  perYear: {
    color: "#bbb",
    fontSize: 15,
    fontWeight: "600",
  },
  description: {
    color: "#ddd",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#39352d",
    marginVertical: 18,
  },
  feature: {
    color: "#f2f2f2",
    fontSize: 13,
    lineHeight: 22,
    marginBottom: 8,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: GOLD,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 22,
  },
  primaryButtonText: {
    color: "#17110a",
    fontWeight: "900",
    fontSize: 13,
    textAlign: "center",
  },
  disabled: { opacity: 0.45 },
  secondaryButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: GOLD,
    fontWeight: "900",
    fontSize: 12,
  },
  success: {
    color: "#9fdaa9",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 19,
  },
  error: {
    color: "#ff8888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 16,
  },
  backButton: { marginTop: 22, padding: 12 },
  backText: { color: "#bbb", fontWeight: "800", fontSize: 12 },
});
