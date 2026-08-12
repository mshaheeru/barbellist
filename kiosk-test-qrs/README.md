# Pro Gym kiosk QR test pack

Scan these at **Attendance → Open Kiosk** while logged into **Pro Gym**.

Generated to match `test-ahmed-qr.png` style (512×512, black/white PNG).

| # | File | Case | Expected kiosk result |
|---|------|------|------------------------|
| 01 | `01-fee-clear-paid__saad-malik.png` | Fee clear / paid — first check-in | Success green · All Clear — Fee Paid |
| 02 | `02-fee-due-soon__kashif-nawaz.png` | Fee due soon | Success · Checked in · Fee due soon |
| 03 | `03-fee-overdue-late__ahmed-khan.png` | Late / overdue fee | Warning · Fee overdue · see reception |
| 04 | `04-already-checked-in-clear__faisal-qureshi.png` | Already checked in (fees clear) | Info blue · Already checked in today |
| 05 | `05-already-checked-in-due-soon__bilal-sheikh.png` | Already checked in + fee due soon | Info · Already checked in · Fee due soon |
| 06 | `06-already-checked-in-overdue__usman-ali.png` | Already checked in + overdue | Warning · Already checked in + fee overdue |
| 07 | `07-frozen-inactive__amna-tariq.png` | Frozen membership | Error · Membership inactive |
| 08 | `08-expired-inactive__maryam-khan.png` | Expired membership | Error · Membership inactive |
| 09 | `09-cancelled-inactive__kiosk-cancelled.png` | Cancelled membership | Error · Membership inactive |
| 10 | `10-outdated-replaced-card__zubair-ahmed.png` | Replaced / outdated QR (old card) | Error · Outdated card |
| 11 | `11-wrong-gym__iron-republic-ahmed.png` | Card from another gym (Iron Republic) | Error · Wrong gym |
| 12 | `12-member-not-found__ghost-uuid.png` | Valid JWT but member UUID missing in Pro Gym | Error · Member not found |
| 13 | `13-invalid-qr__garbage.png` | Invalid / non-Barbellist QR payload | Error · Invalid QR code |

## Notes

- **Already checked in** cases need an open attendance row for today (seeded).
- **Outdated card**: PNG encodes an old JWT; DB holds a newer `card_qr_token`.
- **Wrong gym**: Iron Republic member JWT — scanned on Pro Gym kiosk.
- Re-run: `npx tsx --env-file=.env.local scripts/generate-kiosk-test-qrs.mts`
