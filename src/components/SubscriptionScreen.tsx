import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { getThemedStyles } from "../theme";

type Props = {
  language: "en" | "ar" | "fr";
  theme: "dark" | "light";
  active: boolean;
  onBack: () => void;
};

const GOLD = "#E9B85D";

export default function SubscriptionScreen({ language, theme, active, onBack }: Props) {
  const ui = getThemedStyles(styles, theme);
  const t = (en: string, ar: string, fr: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

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
        ].map((item, index) => <Text key={index} style={ui.feature}>✓  {item}</Text>)}
      </View>

      {active ? (
        <Text style={ui.success}>
          {t("Professional access is active on this account.", "الاشتراك الاحترافي فعال على هذا الحساب.", "L’accès Professionnel est actif sur ce compte.")}
        </Text>
      ) : (
        <Text style={ui.notice}>
          {t(
            "Online subscriptions are temporarily unavailable. To keep Danat Build on Firebase's free plan and prevent unverified payments, purchases are disabled. An administrator can grant or remove Professional access manually.",
            "الاشتراكات عبر الإنترنت غير متاحة مؤقتاً. للحفاظ على الخطة المجانية في Firebase ومنع المدفوعات غير المتحقق منها، تم إيقاف الشراء. يمكن للمدير منح أو إزالة صلاحية المحترف يدوياً.",
            "Les abonnements en ligne sont temporairement indisponibles. Pour conserver l’offre gratuite Firebase et éviter les paiements non vérifiés, les achats sont désactivés. Un administrateur peut accorder ou retirer manuellement l’accès Professionnel."
          )}
        </Text>
      )}

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
  backButton: { marginTop: 22, padding: 12 },
  backText: { color: "#bbb", fontWeight: "800", fontSize: 12 },
});
