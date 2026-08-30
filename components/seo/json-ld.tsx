import { profileFromCountry } from "@/lib/currency";
import { buildFaqData } from "@/components/landing/landing-data";

const usdProfile = profileFromCountry("US");
const faqs = buildFaqData(usdProfile);

const softwareApplication = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Barbellist",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Gym Revenue Recovery System for independent gyms. Finds overdue fees, at-risk members, and missed payments, then recovers them automatically.",
  url: "https://barbellist.com",
  offers: {
    "@type": "Offer",
    price: "1.99",
    priceCurrency: "USD",
    description:
      "Founding Gym: $1.99 per active member per month. First 30 days free. Custom pricing for 200+ members.",
    availability: "https://schema.org/InStock",
  },
};

const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

/** SoftwareApplication schema for the landing / home page. */
export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(softwareApplication),
      }}
    />
  );
}

/** FAQPage schema — use on /faq only. */
export function FaqJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqPage),
      }}
    />
  );
}
