import type { CurrencyProfile } from "@/lib/currency";
import { formatMoney, rateLabel } from "@/lib/currency";

export function buildFaqData(profile: CurrencyProfile) {
  const early = rateLabel(profile, "early");
  const standard = rateLabel(profile, "standard");

  return [
    {
      q: "How is Barbellist different from legacy gym software?",
      a: "Legacy platforms charge flat monthly fees regardless of your size and lock features behind tiers. Barbellist charges per member: a simple monthly rate with every feature included from day one. It was built for independent gyms, not enterprise chains.",
    },
    {
      q: "Do you support gyms outside South Asia?",
      a: "Yes. Barbellist is used by gyms across South Asia, the Middle East, and beyond. The platform supports local currency billing and multiple languages, and WhatsApp reminders work anywhere WhatsApp does.",
    },
    {
      q: `What happens after the first 3 months at ${early}/member?`,
      a: `You move to the Standard rate of ${standard} per member per month, still a fraction of legacy pricing. Nothing changes about your data or features, and there is no lock-in. You can cancel any time.`,
    },
    {
      q: "Do I need special hardware?",
      a: "No. Any phone, tablet, or laptop works as a check-in kiosk. Members simply scan their QR card. Biometric integration is available on the Standard plan if you want it, but it is never required.",
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
