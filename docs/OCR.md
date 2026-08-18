# How EC8A OCR works

Electromon uses two checks on polling-unit results. They are **recommendations** for ward/LGA officers. Officers still approve or return by hand.

1. **Arithmetic** — always runs. It checks that typed figures obey EC8A identities (party totals = valid votes, used = spoiled + rejected + valid, and so on).
2. **Google Cloud Vision OCR** — optional. It reads digits from the EC8A photo and compares them to what the agent typed.

If Vision is not configured, agents see `Google Cloud Vision is not configured` on **Read photo again**. Arithmetic chips still work.

---


## Two jobs OCR does

| Job | When | What happens |
|-----|------|----------------|
| **Auto-fill** | Agent uploads a photo on **My Polling Unit** | API OCRs the image and the web form fills **Check figures** |
| **Verify** | Agent submits the PU result | A background job OCRs the photo again and stores a chip: Match / Return / Check photo |

Auto-fill does **not** submit the result. The agent must still review, edit if needed, save, and submit.
ap
---

## Agent flow (web)

```
Upload EC8A  →  POST /uploads
             →  PATCH /collation/results/:id/ec8a   (attach photo)
             →  POST /collation/ec8a/scan           { photoUrl }
             →  form auto-fills fields + party votes
             →  agent reviews on Check figures
             →  POST /collation/results             (draft)
             →  PATCH /collation/results/:id/submit
```

`POST /collation/ec8a/scan` takes a photo that is already on disk (`/uploads/...`). JPEG/PNG, wait up to ~25s. PDFs are not read.

### Mobile (one call)

```
POST /collation/ec8a/scan-file   multipart field `file` (max 5 MB)
→ { photoUrl, fields, partyResults, confidence, unreadable }
→ agent edits → POST /collation/results → PATCH .../submit
```

Base URL locally: `http://localhost:3001/api/v1`. On a phone, use the LAN URL printed at API boot.

---

## What the parser reads

Vision returns raw text. `ocr-ec8a-parse.ts` turns that into numbers.

### Summary boxes (#1–#8)

The form’s numbered boxes are clustered, then filled in order:

| Box | Field |
|-----|--------|
| #1 | Voters on the register |
| #2 | Accredited voters |
| #3 | Ballot papers issued |
| #4 | Unused ballot papers |
| #5 | Spoiled ballot papers |
| #6 | Rejected ballots |
| #7 | Total valid votes |
| #8 | Used ballot papers |

The parser does **not** treat a lone `#2` or a serial number as a vote count. It looks for the boxed group and for labels like “accredited voters”.

### Party votes

Prefer the **IN WORDS** column (fifty-nine, one hundred and two, including OCR typos like `fiftinine`). If words are missing, fall back to the figures column next to party codes (APC, PDP, …).

Campaign tracked-party codes are used as a last pass so extra parties still get a number when the table parse is thin.

### Confidence

- `unreadable: true` if nothing useful was extracted (or Vision is off / timed out).
- Confidence is `1` only when EC8A identities hold on the extracted numbers (party sum = valid votes, or used = spoiled + rejected + valid). Otherwise it is capped at `0.65`.
- The agent form auto-fills only when confidence is **≥ 0.75**. A clear photo that still parses as serial numbers / LGA codes (party scores ≠ valid votes) is **not** written into Check figures — the agent must type them.

Party table parsing prefers **IN WORDS** over the figures column, and ignores a figure that is the row’s serial number (e.g. SN `4` / ADC / `4` with words ZERO is 0 votes, not 4). Location codes (`03`, `29`, `016`) are not used as register/accredited totals.

---

## Arithmetic identities

These run on **typed** figures (and on seed data) even without Vision:

| Check | Meaning |
|-------|---------|
| Accredited ≤ registered | Cannot accredit more people than are on the register |
| Sum of party scores = total valid votes | EC8A party table vs box #7 |
| Used = spoiled + rejected + valid | Box #8 vs #5 + #6 + #7 |
| Issued = used + unused | Box #3 vs #8 + #4 |
| Accredited = used ballots | Box #2 vs #8 |

A failed check sets `recommendation: RETURN` and fills `suggestedRejectReason` for the ward return form.

---

## Stored verification (`ocrVerification` JSON)

Saved on `CollationResult` with `ocrVerifiedAt`.

| Field | Values |
|-------|--------|
| `status` | `MATCH` · `MISMATCH` · `UNREADABLE` · `PENDING` |
| `recommendation` | `APPROVE` · `RETURN` · `CHECK_PHOTO` |
| `engine` | `ARITHMETIC` (typed identities only) or `OCR` (photo compared) |

**Recommendations**

- **APPROVE** — figures line up (and photo matches, if OCR ran).
- **RETURN** — identities fail, or typed numbers disagree with the photo. Ward UI prefills the return reason.
- **CHECK_PHOTO** — no figures yet, photo unreadable, Vision missing, or OCR still queued.

On submit, if there is a photo and arithmetic is not already `RETURN`, status is set to `PENDING` / `CHECK_PHOTO` (`OCR_PENDING`) until the worker finishes.

---

## Background OCR (after submit)

```
submit PU result
  → ocrVerificationWrite(..., awaitingOcr: true)
  → publish job to RabbitMQ queue `ocr.verify`
  → OcrVerifyWorker:
       arithmetic on typed row
       Vision on attached photos
       mergeVisionWithArithmetic()
       persist JSON
```

If RabbitMQ is down, the same worker still runs in-process via the event bus.

Merge rules:

- Arithmetic diffs always stay.
- If Vision is unreadable / not configured, keep arithmetic; recommendation is `CHECK_PHOTO` unless arithmetic already says `RETURN`.
- If Vision reads a field (or party) that differs from typed, add an OCR mismatch diff.

Ward and LGA screens sort flagged PUs first (`RETURN`, then `CHECK_PHOTO`, then match).

---

## Code map

| Piece | Path |
|-------|------|
| Vision client | `src/modules/collation/google-vision.service.ts` |
| Text → fields / parties | `src/modules/collation/ocr-ec8a-parse.ts` |
| Identities + JSON shape | `src/modules/collation/ocr-verification.ts` |
| Scan + submit + queue | `src/modules/collation/collation.service.ts` |
| HTTP | `POST /collation/ec8a/scan`, `POST /collation/ec8a/scan-file` |
| Queue | `ocr-queue.service.ts`, `ocr-verify.worker.ts` |
| Agent UI | `electromon-web` → My Polling Unit → Upload EC8A / Check figures |
| Officer UI | `verification-chip.tsx`, ward PU panel, LGA review |

Prisma: `CollationResult.ocrVerification` (JSONB), `ocrVerifiedAt`.

---

## Environment

The API container must receive credentials (Compose `apps.yml` passes these through):

```bash
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
# Preferred in Docker (JSON, one line):
GOOGLE_CLOUD_VISION_CREDENTIALS='{"type":"service_account",...}'
# Or a key file path the process can read:
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/vision-service-account.json
```

Without them, boot log:

`Google Cloud Vision is not configured; set GOOGLE_CLOUD_VISION_CREDENTIALS or GOOGLE_APPLICATION_CREDENTIALS`

With JSON:

`Google Cloud Vision initialized from JSON credentials`

Do not commit the service-account file. `.secrets/` is gitignored. Billing must be enabled on the GCP project for Cloud Vision.

---

## What OCR does not do

- It does not approve or reject a result.
- It does not skip the agent review step.
- It does not read PDFs.
- It is not a substitute for looking at the photo when the chip says **Check photo**.
- Seed demos (ATAFI `17-13-01-001` … `005`) use **arithmetic profiles** (match / party mismatch / used mismatch / accredited-over). They do not need Vision.
