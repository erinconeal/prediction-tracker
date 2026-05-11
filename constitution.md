# Prediction Tracker — Scoring Constitution (v1.2)

## 1. Purpose

This system evaluates **predictive calibration**, not intent, honesty, or reasoning.

It answers:
> *When a person makes a clear, forward-looking claim, how often are they correct?*

It does **not** evaluate:
- Motive or honesty
- Quality of reasoning
- Whether a prediction was reasonable at the time

---

## 2. Scope (v1 Constraints)

To ensure consistency and reliability, v1 enforces strict limitations:

- Only **binary predictions** are eligible for scoring (true / false outcomes)
- Predictions must include an **explicit timeframe**
- **Tracked sources:** The system maintains an explicit **allowlist of sources** (public figures, accounts, or feeds). **v1 targets roughly 10–20 concurrent sources** — enough for breadth, small enough for consistent review and transparency.
- **Capture:** **NLP and automation may ingest content and propose candidate predictions.** A candidate is **not** scored until it has passed **human review** and is promoted to an official prediction record that satisfies Sections 3–5.
- No partial credit
- Prefer a **single domain** per dataset or release when it improves clarity (not a hard global limit on the product)

**Clarification:**  
All stored predictions ultimately resolve into one of four lifecycle outcomes:
- Correct
- Incorrect
- Unresolved
- Invalid

However, **accuracy metrics are calculated using only Correct and Incorrect predictions that reached a definitive resolution**.

---

## 3. Definition of a Valid Prediction

A statement is only scorable if it meets **all** criteria below:

### 3.1 Future-Oriented
The statement refers to an event that occurs **after** it was made.

### 3.2 Falsifiable
There must be a clear outcome that could prove the statement wrong.

- ✅ “Candidate X will win the 2026 election”
- ❌ “The economy is doing badly”

### 3.3 Specific Outcome
The prediction must clearly define:
- What will happen
- To whom or what
- In measurable terms

### 3.4 Explicit Timeframe (Required)
The prediction must include a clear deadline or time window.

- ✅ “By December 31, 2026”
- ❌ “Eventually” or “soon”

Predictions without a timeframe are **invalid**.

### 3.5 Binary Resolution
The outcome must resolve cleanly as:
- Occurred
- Did not occur

Predictions requiring interpretation or degrees are excluded.

---

## 4. Exclusions

The following are **not scored**:

- Opinions or sentiment
- Vague or metaphorical statements
- Predictions without timeframes
- Predictions that cannot be tied to a verifiable outcome
- Trivial or obvious statements

---

## 5. Prediction Lifecycle

### 5.1 Capture

Each prediction must include:

- Original text (unaltered)
- Author/source (must be on the tracked-source allowlist for that dataset)
- Timestamp (when stated)
- Defined outcome
- Resolution criteria
- **Resolution deadline** (end of the prediction window)

If automation proposed the row, also retain traceability for transparency (e.g., link or reference to the ingested content, extraction metadata, and record of human promotion).

### 5.2 Resolution Metadata (Post-Outcome)

Once resolved, the following are recorded:

- **Resolved at** (timestamp of resolution)
- Outcome (Correct / Incorrect / Unresolved / Invalid)
- Source used for resolution

### 5.3 Storage

Predictions are stored in their **original form**.  
Any summaries or interpretations are secondary and must not replace the original.

---

## 6. Resolution Rules

### 6.1 Resolution Source

Each prediction must define a **primary source of truth**, such as:

- Official election results
- Government statistics
- Market closing prices
- Final sports scores

If no authoritative source exists → prediction is **invalid**

---

### 6.2 Resolution Timing

Predictions are resolved **only after the resolution deadline passes**.

Early resolution is allowed only if the outcome becomes **logically impossible to change**.

Examples:
- A predicted election winner withdraws before the vote
- A predicted merger is officially completed ahead of schedule via regulatory filing
- A team is mathematically eliminated from reaching a predicted outcome

---

### 6.3 Allowed Outcomes

Each prediction resolves to exactly one:

- **Correct**
- **Incorrect**
- **Unresolved**
- **Invalid**

#### Definitions

- **Correct** → Outcome occurred as stated  
- **Incorrect** → Outcome did not occur  
- **Unresolved** → Outcome cannot be determined with confidence  
- **Invalid** → Prediction failed to meet inclusion criteria  

---

## 7. Scoring System

### 7.1 Binary Scoring

- Correct = 1  
- Incorrect = 0  

No partial credit.

---

### 7.2 Accuracy Calculation

Accuracy = Correct / (Correct + Incorrect)

Only predictions with definitive outcomes (Correct or Incorrect) are included.

Unresolved and Invalid predictions are excluded.

---

### 7.3 Required Context Metrics

All accuracy metrics must be displayed alongside:

- Total predictions scored (Correct + Incorrect)
- Time range
- Number of Unresolved predictions
- Number of Invalid predictions

**Clarification:**

- **Unresolved** → Predictions that met inclusion criteria but could not be definitively resolved  
- **Invalid** → Predictions that failed inclusion criteria and were excluded from scoring  

Both categories are excluded from accuracy calculations but must be surfaced for transparency.

Accuracy without full context is misleading and must not be shown.

---

## 8. Anti-Gaming Rules

### 8.1 No Retrospective Entries
Predictions must be recorded **before** the outcome is known.

**Automation:** For NLP-suggested candidates, this rule applies at **human promotion** to an official prediction: promotion must not occur after the outcome was already knowable, except by explicit invalidation or exclusion under these rules.

---

### 8.2 Immutability

Predictions cannot be edited after capture.

If corrections are required (e.g., transcription errors), they must be handled via:
- Append-only correction records, or
- Explicit invalidation and re-entry

The original record must remain preserved.

---

### 8.3 No Selective Inclusion

When tracking a source, inclusion rules must be defined:

- Fixed time window **or**
- Complete dataset (e.g., all posts within a timeframe)

Cherry-picking predictions is not allowed.

---

## 9. Transparency Requirements

Each dataset must disclose:

- Who is being tracked (including the **allowlist size** and cap, e.g. up to 10–20 sources in v1)
- Source of predictions
- Time period covered
- Total statements reviewed
- Total predictions included

Users must be able to:
- View the original prediction
- See how it was resolved
- Verify the outcome source

---

## 10. Presentation Rules

### 10.1 No Standalone Accuracy
Accuracy must always be shown with:
- Number of predictions
- Timeframe

---

### 10.2 Prefer Time-Based Views

Where possible, show:

- Accuracy over time
- Rolling performance windows

---

### 10.3 Drill-Down Required

Every aggregate score must link to:
- Underlying predictions
- Individual outcomes

---

## 11. Handling Ambiguity

### 11.1 Default Rule: Do Not Infer

If a prediction cannot be clearly resolved:
→ Mark as **Unresolved**

Do not guess or interpret intent.

---

### 11.2 Disputed Outcomes

If credible sources disagree:
→ Mark as **Unresolved**

---

## 12. Versioning

This constitution is versioned.

- All predictions are scored under the rules active at the time
- Changes to rules do not retroactively alter past scores

---

## 13. Guiding Principle

> When in doubt, exclude.

It is better to discard ambiguous predictions than to introduce inconsistency.

Consistency is more important than coverage.