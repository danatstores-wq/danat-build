import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
} from "react-native-google-mobile-ads";

type Props = {
  language: "en" | "ar" | "fr";
};

export default function AdPrivacyOptionsButton({ language }: Props) {
  const [required, setRequired] = useState(false);
  const [busy, setBusy] = useState(false);

  const t = (en: string, ar: string, fr: string) =>
    language === "ar" ? ar : language === "fr" ? fr : en;

  const refresh = async () => {
    try {
      const info = await AdsConsent.getConsentInfo();
      setRequired(
        info.privacyOptionsRequirementStatus
          === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED
      );
    } catch (error) {
      console.warn("Could not read ad privacy options status:", error);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openOptions = async () => {
    setBusy(true);
    try {
      await AdsConsent.showForm();
      await refresh();
    } catch (error) {
      console.warn("Could not open ad privacy options:", error);
    } finally {
      setBusy(false);
    }
  };

  if (!required) return null;

  return (
    <Pressable style={styles.button} onPress={openOptions} disabled={busy}>
      <Text style={styles.text}>
        {busy
          ? t("PLEASE WAIT…", "يرجى الانتظار…", "VEUILLEZ PATIENTER…")
          : t("PRIVACY & AD CHOICES", "الخصوصية وخيارات الإعلانات", "CONFIDENTIALITÉ ET PUBLICITÉS")}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E9B85D",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 18,
  },
  text: {
    color: "#E9B85D",
    fontWeight: "900",
    fontSize: 12,
  },
});
