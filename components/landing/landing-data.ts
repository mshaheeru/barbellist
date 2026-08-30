import type { CurrencyProfile } from "@/lib/currency";
import { formatMoney, rateLabel } from "@/lib/currency";

export function buildFaqData(profile: CurrencyProfile) {
  const rate = rateLabel(profile, "early");
  const min = formatMoney(profile.earlyMin, profile);
  const cap = profile.memberCap;

  return [
    {
      q: "How is Barbellist different from legacy gym software?",
      a: "Legacy platforms charge flat monthly fees and lock features behind tiers. Barbellist charges per active member, with every core feature included. It was built for independent gyms, not enterprise chains.",
    },
    {
      q: "Do you support gyms outside South Asia?",
      a: "Yes. Barbellist is used by gyms across South Asia, the Middle East, and beyond. The platform supports local currency billing and WhatsApp reminders work anywhere WhatsApp does.",
    },
    {
      q: `How does pricing work at ${rate}/member?`,
      a: `You pay ${rate} per active member per month, with a minimum of ${min}. Former members, leads, and staff don't count. Gyms with ${cap}+ members get custom pricing. First 30 days are free.`,
    },
    {
      q: "Who counts as an active member?",
      a: "Only active paid memberships. Former members, leads, staff, and archived records don't count toward billing.",
    },
    {
      q: "Do I need special hardware?",
      a: "No. Any phone, tablet, or laptop works as a check-in kiosk. Members simply scan their QR card. Biometric integration is never required to start.",
    },
    {
      q: "Is my member data secure?",
      a: "Yes. Data is encrypted in transit and at rest, QR cards are cryptographically signed to prevent tampering, and each gym\u2019s data is fully isolated. You own your data and can export it at any time.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Always. There are no contracts, no lock-in, and no cancellation fees. If Barbellist stops paying for itself, you are free to leave, though most owners find the opposite happens.",
    },
  ];
}

export { formatMoney };

export const chartData = [
  { r: 62, e: 30 },
  { r: 70, e: 34 },
  { r: 66, e: 28 },
  { r: 82, e: 36 },
  { r: 90, e: 38 },
  { r: 100, e: 40 },
];

export const qrPattern = [
  1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1,
];
