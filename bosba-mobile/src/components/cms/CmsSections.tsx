import { useEffect, useState } from "react";
import {
  View, Text, Image, StyleSheet, TouchableOpacity, Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { getCmsSections } from "../../lib/api";
import { useI18n } from "../../context/i18n";

const BRAND = "#e51b1b";

// Mirrors the website's PageSection DTO (the public /api/cms/sections feed).
type SectionType =
  | "hero" | "promo_banner" | "text" | "image"
  | "category_grid" | "product_carousel" | "faq" | "testimonials";

type CmsSection = {
  id: string;
  type: SectionType;
  titleEn: string | null;
  titleKm: string | null;
  subtitleEn: string | null;
  subtitleKm: string | null;
  image: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  bgColor: string | null;
  textColor: string | null;
};

/**
 * Renders the PUBLISHED, mobile-targeted CMS blocks at the top of a screen.
 * Additive & non-breaking: when nothing is published (or the request fails) it
 * renders null, so the hardcoded screen below is untouched. The Developer
 * "Homepage Builder" controls these — the same blocks the website shows.
 */
export function CmsSections({ page = "home" }: { page?: string }) {
  const { locale } = useI18n();
  const [sections, setSections] = useState<CmsSection[]>([]);

  useEffect(() => {
    let alive = true;
    getCmsSections("mobile", page)
      .then((data: { sections?: CmsSection[] }) => {
        if (alive) setSections(data.sections ?? []);
      })
      .catch(() => {
        // Non-critical: keep the hardcoded screen if the feed is unavailable.
      });
    return () => {
      alive = false;
    };
  }, [page]);

  if (sections.length === 0) return null;

  return (
    <View>
      {sections.map((s) => (
        <SectionBlock key={s.id} section={s} locale={locale} />
      ))}
    </View>
  );
}

function pick(en: string | null, km: string | null, locale: string): string {
  return (locale === "km" ? km || en : en || km) ?? "";
}

function SectionBlock({ section: s, locale }: { section: CmsSection; locale: string }) {
  const router = useRouter();
  const title = pick(s.titleEn, s.titleKm, locale);
  const subtitle = pick(s.subtitleEn, s.subtitleKm, locale);
  const hasCta = !!(s.buttonText && s.buttonLink);

  function onCta() {
    const link = s.buttonLink;
    if (!link) return;
    if (link.startsWith("/")) router.push(link as never);
    else Linking.openURL(link).catch(() => {});
  }

  if (s.type === "hero") {
    return (
      <View style={[styles.hero, s.bgColor ? { backgroundColor: s.bgColor } : null]}>
        {!!title && (
          <Text style={[styles.heroTitle, s.textColor ? { color: s.textColor } : null]}>
            {title}
          </Text>
        )}
        {!!subtitle && (
          <Text style={[styles.heroSub, s.textColor ? { color: s.textColor } : null]}>
            {subtitle}
          </Text>
        )}
        {hasCta && (
          <TouchableOpacity style={styles.heroCta} activeOpacity={0.85} onPress={onCta}>
            <Text style={styles.heroCtaText}>{s.buttonText}</Text>
            <ArrowRight size={16} color={BRAND} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (s.type === "image") {
    if (!s.image) return null;
    const img = (
      <Image source={{ uri: s.image }} style={styles.image} resizeMode="cover" />
    );
    return (
      <View style={styles.imageWrap}>
        {hasCta ? (
          <TouchableOpacity activeOpacity={0.9} onPress={onCta}>
            {img}
          </TouchableOpacity>
        ) : (
          img
        )}
      </View>
    );
  }

  if (s.type === "text") {
    return (
      <View style={styles.textBlock}>
        {!!title && (
          <Text style={[styles.textTitle, s.textColor ? { color: s.textColor } : null]}>
            {title}
          </Text>
        )}
        {!!subtitle && (
          <Text style={[styles.textBody, s.textColor ? { color: s.textColor } : null]}>
            {subtitle}
          </Text>
        )}
      </View>
    );
  }

  // promo_banner + the remaining structured types share a safe titled card.
  return (
    <View style={[styles.promo, s.bgColor ? { backgroundColor: s.bgColor } : null]}>
      {!!title && (
        <Text style={[styles.promoTitle, s.textColor ? { color: s.textColor } : null]}>
          {title}
        </Text>
      )}
      {!!subtitle && (
        <Text style={[styles.promoSub, s.textColor ? { color: s.textColor } : null]}>
          {subtitle}
        </Text>
      )}
      {hasCta && (
        <TouchableOpacity style={styles.promoCta} activeOpacity={0.85} onPress={onCta}>
          <Text style={styles.promoCtaText}>{s.buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: "#7f1d1d",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
  },
  heroTitle: { color: "#fff", fontSize: 26, fontWeight: "900", lineHeight: 32, marginBottom: 8 },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  heroCta: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 10,
    borderRadius: 9999, alignSelf: "flex-start",
  },
  heroCtaText: { color: BRAND, fontWeight: "700", fontSize: 14 },

  imageWrap: { paddingHorizontal: 16, paddingTop: 16 },
  image: { width: "100%", aspectRatio: 16 / 9, borderRadius: 16, backgroundColor: "#f1f5f9" },

  textBlock: { paddingHorizontal: 20, paddingVertical: 20 },
  textTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a", textAlign: "center", marginBottom: 6 },
  textBody: { fontSize: 14, color: "#475569", textAlign: "center", lineHeight: 20 },

  promo: {
    margin: 16, backgroundColor: "#0f172a", borderRadius: 20, padding: 24,
  },
  promoTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 8 },
  promoSub: { color: "#cbd5e1", fontSize: 14, lineHeight: 20, marginBottom: 16 },
  promoCta: {
    backgroundColor: BRAND, paddingHorizontal: 20, paddingVertical: 11,
    borderRadius: 9999, alignSelf: "flex-start",
  },
  promoCtaText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
