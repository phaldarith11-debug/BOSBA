import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { getPublishedSections, type PageSectionDTO } from "@/lib/cms";

/**
 * Renders the PUBLISHED CMS layout blocks for a page on the website. Additive &
 * non-breaking: when no blocks are published (the default / pre-migration), it
 * renders nothing, so the existing hardcoded page is untouched. As soon as a
 * Developer publishes a block in the Homepage Builder, it appears here live.
 *
 * Only a fixed, safe set of block types is rendered — no raw HTML is ever
 * injected. Colors/links are pre-validated in @/lib/cms.
 */
export async function CmsSections({
  page = "home",
  locale,
}: {
  page?: string;
  locale: string;
}) {
  const sections = await getPublishedSections(page, "web");
  if (sections.length === 0) return null;

  return (
    <div className="cms-sections">
      {sections.map((s) => (
        <SectionBlock key={s.id} s={s} locale={locale} />
      ))}
    </div>
  );
}

function pick(en: string | null, km: string | null, locale: string): string {
  return (locale === "km" ? km || en : en || km) ?? "";
}

/** Internal links go through the i18n <Link>; external links use a plain <a>. */
function CtaButton({
  text,
  href,
  className,
}: {
  text: string;
  href: string;
  className: string;
}) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {text}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {text}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function SectionBlock({ s, locale }: { s: PageSectionDTO; locale: string }) {
  const title = pick(s.titleEn, s.titleKm, locale);
  const subtitle = pick(s.subtitleEn, s.subtitleKm, locale);
  const hasCta = s.buttonText && s.buttonLink;
  const style: React.CSSProperties = {};
  if (s.bgColor) style.backgroundColor = s.bgColor;
  if (s.textColor) style.color = s.textColor;

  switch (s.type) {
    case "hero":
      return (
        <section
          className="relative overflow-hidden bg-hero-gradient"
          style={s.bgColor || s.textColor ? style : undefined}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 text-center md:text-left">
            {title && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight text-white text-balance">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 sm:mt-4 text-base sm:text-lg text-white/90 max-w-xl mx-auto md:mx-0">
                {subtitle}
              </p>
            )}
            {hasCta && (
              <div className="mt-6 flex justify-center md:justify-start">
                <CtaButton
                  text={s.buttonText!}
                  href={s.buttonLink!}
                  className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-6 sm:px-7 py-3 sm:py-3.5 rounded-full hover:bg-yellow-50 active:scale-95 transition-all shadow-lg"
                />
              </div>
            )}
          </div>
        </section>
      );

    case "image":
      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {s.image &&
            (hasCta ? (
              <CtaImage image={s.image} alt={title} href={s.buttonLink!} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image} alt={title} className="w-full rounded-3xl object-cover" />
            ))}
        </section>
      );

    case "text":
      return (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center" style={style}>
          {title && <h2 className="text-2xl sm:text-3xl font-bold">{title}</h2>}
          {subtitle && <p className="mt-3 leading-relaxed text-gray-600">{subtitle}</p>}
        </section>
      );

    case "promo_banner":
    case "product_carousel":
    case "category_grid":
    case "faq":
    case "testimonials":
    default:
      // Shared safe layout for the remaining structured types: a titled card
      // with optional subtitle, image and CTA. Richer per-type rendering can be
      // layered on later without changing the data model.
      return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div
            className="relative overflow-hidden rounded-3xl bg-dark-gradient p-8 sm:p-12"
            style={s.bgColor || s.textColor ? style : undefined}
          >
            {s.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-30"
              />
            )}
            <div className="relative max-w-xl">
              {title && (
                <h3 className="text-2xl sm:text-3xl font-black text-white">{title}</h3>
              )}
              {subtitle && <p className="mt-2 text-gray-300 leading-relaxed">{subtitle}</p>}
              {hasCta && (
                <div className="mt-6">
                  <CtaButton
                    text={s.buttonText!}
                    href={s.buttonLink!}
                    className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-7 py-3.5 rounded-full hover:bg-red-700 active:scale-95 transition-all shadow-btn"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      );
  }
}

function CtaImage({ image, alt, href }: { image: string; alt: string; href: string }) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt={alt} className="w-full rounded-3xl object-cover" />
  );
  if (href.startsWith("/")) return <Link href={href}>{img}</Link>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {img}
    </a>
  );
}
