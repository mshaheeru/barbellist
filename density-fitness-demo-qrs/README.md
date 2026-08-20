# Density Fitness — kiosk QR demo pack

For **Saturday 22 Aug 2026, 3:30 PM PKT** customer demo.

Login as Density owner → **Attendance → Open Kiosk**, then scan each PNG
(phone screen or print). Use full-screen / zoom so the camera locks quickly.

## Demo order (recommended)

| # | File | Case | Expected |
|---|------|------|----------|
| 01 | `01-fee-clear__waqar-shah-demo-0014.png` | Fee clear / paid — first check-in<br/>_Waqar Shah (DEMO-0014)_ | Success green · All Clear — Fee Paid |
| 02 | `02-fee-due-soon__fatima-riaz-demo-0017.png` | Fee due soon<br/>_Fatima Riaz (DEMO-0017)_ | Success · Checked in · Fee due soon |
| 03 | `03-fee-partial-overdue__ahmed-khan-demo-0001.png` | Partial payment (shows as overdue)<br/>_Ahmed Khan (DEMO-0001)_ | Warning · Fee overdue · see reception |
| 04 | `04-fee-overdue__hina-butt-demo-0020.png` | Late / overdue fee<br/>_Hina Butt (DEMO-0020)_ | Warning · Fee overdue · see reception |
| 05 | `05-already-checked-in-clear__saad-malik-demo-0007.png` | Already checked in (fees clear)<br/>_Saad Malik (DEMO-0007)_ | Info blue · Already checked in today |
| 06 | `06-already-checked-in-due-soon__danish-rehman-demo-0013.png` | Already checked in + fee due soon<br/>_Danish Rehman (DEMO-0013)_ | Info · Already checked in · Fee due soon |
| 07 | `07-already-checked-in-overdue__sara-ahmed-demo-0019.png` | Already checked in + overdue<br/>_Sara Ahmed (DEMO-0019)_ | Warning · Already checked in + fee overdue |
| 08 | `08-frozen-inactive__amna-tariq-demo-0022.png` | Frozen membership<br/>_Amna Tariq (DEMO-0022)_ | Error · Member is not active |
| 09 | `09-expired-inactive__nadia-akhtar-demo-0024.png` | Expired membership<br/>_Nadia Akhtar (DEMO-0024)_ | Error · Member is not active |
| 10 | `10-outdated-replaced-card__zubair-ahmed-demo-0010.png` | Replaced / outdated QR (old card)<br/>_Zubair Ahmed (DEMO-0010)_ | Error · Outdated card — use the latest card |
| 11 | `11-wrong-gym__iron-republic-ahmed-khan.png` | Card from another gym (Iron Republic)<br/>_Ahmed Khan (IR-1001) · Iron Republic_ | Error · This card belongs to another gym |
| 12 | `12-member-not-found__ghost-uuid.png` | Valid JWT but member missing<br/>_(ghost UUID)_ | Error · Member not found |
| 13 | `13-invalid-qr__garbage.png` | Invalid / non-Barbellist QR payload<br/>_(garbage payload)_ | Error · Invalid QR code |

## Spare clear cards

Extra paid members if you want multiple happy-path scans:

- `spare-clear__asad-hussain-demo-0015.png` — Asad Hussain (DEMO-0015)
- `spare-clear__ayesha-malik-demo-0016.png` — Ayesha Malik (DEMO-0016)
- `spare-clear__zainab-iqbal-demo-0018.png` — Zainab Iqbal (DEMO-0018)

## Notes

- **Already checked in** rows are pre-seeded open sessions on demo day (22 Aug).
- **Due soon** dues were adjusted to Aug 23–24 for the demo window.
- **Outdated card**: PNG has an old JWT; DB has a newer `card_qr_token`.
- **Wrong gym**: Iron Republic member JWT scanned on Density kiosk.
- Re-run: `npx tsx --env-file=.env.local scripts/generate-density-demo-qrs.mts`
