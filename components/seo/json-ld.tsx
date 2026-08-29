import { profileFromCountry } from "@/lib/currency";
import { buildFaqData } from "@/components/landing/landing-data";

const pkrProfile = profileFromCountry("PK");
const faqs = buildFaqData(pkrProfile);

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
    price: "35000",
    priceCurrency: "PKR",
    description:
      "Founding Gym: Rs. 35,000 per month, up to 150 members included. First 30 days free.",
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
