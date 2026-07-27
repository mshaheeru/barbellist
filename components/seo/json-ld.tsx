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
    "All-in-one gym management platform for independent gyms. Manage members, fees, attendance, staff, expenses, and inventory.",
  url: "https://barbellist.com",
  offers: {
    "@type": "Offer",
    price: String(usdProfile.earlyRate),
    priceCurrency: "USD",
    description:
      "Early Access — $1 per member per month for the first 3 months",
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

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplication),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPage),
        }}
      />
    </>
  );
}
