# Phase 1 Contract

Implement Skill Intelligence — Phase 1.

Read and follow:

- docs/specs/skill-intelligence.md
- docs/engineering/AI_ENGINEERING.md
- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

The Skill Intelligence specification is the single source of truth.

Scope:
Implement ONLY Phase 1 defined in the specification.

Phase 1 must establish the deterministic foundation:

- SkillProfile types/contracts
- JSON Schema
- runtime validators/type guards
- Master CV skill normalization
- first-seen duplicate handling
- taxonomy validation
- evidence validation
- deterministic priority calculation
- Skill Profile invariants
- unit tests

Do not implement anything belonging to later phases:

- no OpenAI/AI service
- no backend cache
- no Optimized CV integration
- no Cover Letter integration
- no Prisma/migrations
- no API endpoints
- no frontend changes
- no LangGraph/RAG/MCP/multi-agent work

First inspect the existing repository and reuse established
types, validation, schema, utility, and testing patterns where
appropriate. Avoid duplicating existing utilities.

After implementation, run the relevant tests, typecheck, lint,
and build.

Do not modify unrelated code or fix unrelated pre-existing issues.

Do not proceed to Phase 2.

Report:

1. Files created/modified
2. What was implemented
3. Tests and validation results
4. Any deviation or ambiguity found in the specification

# Phase 2 IA skill Intelligence

Implement Skill Intelligence — Phase 2.

Read and follow:

- docs/specs/skill-intelligence.md
- docs/engineering/AI_ENGINEERING.md
- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

The Skill Intelligence specification is the single source of truth.

Scope:
Implement ONLY Phase 2 defined in the specification.

Phase 2 must introduce the Skill Intelligence AI service:

- curated AI payload
- strict structured output
- OpenAI integration following existing repository patterns
- AI output validation using the Phase 1 contract
- deterministic post-AI validation/invariants
- tests

Reuse the existing AI service, OpenAI, JSON Schema, validation,
error-handling, and prompt conventions already established in the API.

The AI must only provide the semantic fields defined by the spec.
Final `priority` remains deterministic and must not be requested
from or accepted from the model.

Do not implement anything belonging to later phases:

- no backend cache
- no Optimized CV integration
- no Cover Letter integration
- no Prisma/migrations
- no API endpoints
- no frontend changes
- no LangGraph/RAG/MCP/multi-agent work

Do not modify unrelated existing behavior.

After implementation, run the relevant tests, typecheck, lint,
and build.

Do not proceed to Phase 3.

Report:

1. Files created/modified
2. AI service implemented
3. Prompt/input/output validation approach
4. Tests and validation results
5. Any deviation or ambiguity found in the specification
6. Confirmation that Phase 3+ was not implemented

# Phase 3 Backend Cache + fingerprint

Implement Skill Intelligence — Phase 3.

Read and follow:

- docs/specs/skill-intelligence.md
- docs/engineering/AI_ENGINEERING.md
- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

The Skill Intelligence specification is the single source of truth.

Scope:
Implement ONLY Phase 3 defined in the specification.

Phase 3 must add the backend process-scoped Skill Profile cache,
including:

- lazy cache lookup/computation
- source fingerprint generation
- skillProfileContractVersion
- cache identity defined by the specification
- cache hit/miss behavior
- natural invalidation when relevant inputs change
- tests

Reuse the existing Phase 1 and Phase 2 implementation.

The existing deterministic payload builder should be reused for
fingerprinting where appropriate.

Important:

- Cache must remain backend-only and process-scoped.
- No Prisma or database persistence.
- No public API endpoint.
- No frontend cache.
- No cache-related UI.
- No automatic retry or fallback Skill Profile.
- Cache misses must use the existing Phase 2 AI service.
- Skill Intelligence failures remain fail-closed.

Do not implement later phases:

- no Optimized CV integration
- no Cover Letter integration
- no document generation changes
- no frontend changes
- no LangGraph/RAG/MCP/multi-agent work

Do not modify unrelated behavior.

After implementation, run the relevant tests, typecheck, lint,
and build.

Do not proceed to Phase 4.

Report:

1. Files created/modified
2. Cache architecture implemented
3. Fingerprint strategy
4. Cache hit/miss/invalidation behavior
5. Tests and validation results
6. Any deviation or ambiguity found in the specification
7. Confirmation that Phase 4+ was not implemented

# Phase 4 Optimized CV integration

Implement Skill Intelligence — Phase 4.

Read and follow:

- docs/specs/skill-intelligence.md
- docs/engineering/AI_ENGINEERING.md
- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

The Skill Intelligence specification is the single source of truth.

Scope:
Implement ONLY Phase 4: Optimized CV integration.

Integrate the existing Skill Intelligence pipeline into Optimized CV
generation:

- use the authenticated application context and existing ownership
  conventions
- obtain the Skill Profile through the Phase 3 cache
- provide the Skill Profile to the Optimized CV AI generation
- use Skill Profile priority/relevance to improve skill ordering and
  professional-summary emphasis
- preserve Master CV as the authoritative skill inventory
- preserve existing deterministic Optimized CV integrity enforcement
- keep generated document skills as `sourceSkill`
- ensure no skill can be invented, removed, or replaced by
  `canonicalSkill`
- preserve existing Optimized CV behavior outside the Skill
  Intelligence changes

The Skill Profile must be computed before Optimized CV generation
needs it and failures must remain fail-closed according to the spec.

Reuse the existing Phase 1–3 implementation. Do not duplicate
Skill Intelligence logic inside Optimized CV services.

Update/add tests for the integration and regression behavior.

Do not implement later phases:

- no Cover Letter integration
- no Cover Letter changes
- no Prisma/migrations
- no frontend/UI changes unless strictly required by an existing
  Optimized CV test contract
- no public Skill Intelligence API
- no LangGraph/RAG/MCP/multi-agent work

Do not modify unrelated behavior.

After implementation, run the relevant tests, typecheck, lint,
and build.

Do not proceed to Phase 5.

Report:

1. Files created/modified
2. How Skill Profile is consumed by Optimized CV
3. How priority/relevance affects generation
4. Integrity/regression protections
5. Tests and validation results
6. Any deviation or ambiguity found in the specification
7. Confirmation that Cover Letter/Phase 5 was not implemented

# Phase 5 Cover Letter integration

Implement Skill Intelligence — Phase 5.

Read and follow:

- docs/specs/skill-intelligence.md
- docs/engineering/AI_ENGINEERING.md
- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

The Skill Intelligence specification is the single source of truth.

Scope:
Implement ONLY Phase 5: Cover Letter integration.

Integrate the existing Skill Intelligence pipeline into Cover Letter
generation:

- obtain the Skill Profile through the Phase 3 cache
- use the same Skill Profile already used by Optimized CV
- provide it to the Cover Letter AI generation
- use priority/relevance and evidence to guide which existing
  professional skills should be emphasized
- preserve Master CV as the authoritative candidate skill inventory
- preserve `sourceSkill` as the document-facing skill value
- never introduce skills from `canonicalSkill`, Profile Match,
  Job Analysis, or any other external source
- preserve all existing Cover Letter factual-integrity rules
- preserve existing Cover Letter behavior outside the Skill
  Intelligence integration

Reuse the existing Phase 1–4 implementation. Do not duplicate
Skill Intelligence logic inside Cover Letter services.

Skill Intelligence must be obtained before the Cover Letter AI call
and failures must remain fail-closed according to the specification.

Do not implement anything beyond Phase 5:

- no Phase 6 regression/QA work
- no Prisma/migrations
- no frontend/UI changes
- no public Skill Intelligence API
- no LangGraph/RAG/MCP/multi-agent work

Do not modify unrelated behavior.

After implementation, run the relevant tests, typecheck, lint,
and build.

Do not proceed to Phase 6.

Report:

1. Files created/modified
2. How Skill Profile is consumed by Cover Letter
3. How priority/relevance/evidence affect generation
4. Factual-integrity protections
5. Tests and validation results
6. Any deviation or ambiguity found in the specification
7. Confirmation that Phase 6 was not implemented

# Phase 6 Cross-feature regression

Complete Skill Intelligence — Phase 6.

Read and follow:

- docs/specs/skill-intelligence.md
- docs/engineering/AI_ENGINEERING.md
- docs/engineering/PROJECT_RULES.md
- docs/engineering/DEVELOPMENT_GUIDE.md

The Skill Intelligence specification is the single source of truth.

Scope:
Perform ONLY Phase 6: cross-feature regression, integration validation,
and QA defined in the specification.

Do NOT add new architecture or features.

Audit the complete Skill Intelligence implementation from Phase 1
through Phase 5 and verify that it remains consistent with the
specification.

Validate at minimum:

- Master CV remains the only authoritative candidate skill inventory
- Skill Profile completeness
- deterministic normalization and duplicate handling
- deterministic priority calculation
- AI output validation and fail-closed behavior
- evidence validation
- backend cache isolation and fingerprint invalidation
- Optimized CV integration
- Cover Letter integration
- shared Skill Profile consistency between both generators
- `sourceSkill` vs `canonicalSkill` boundaries
- Profile Match remains a signal only
- Job Analysis skills cannot become candidate skills
- no invented skills
- `jobRelevance: "none"` remains valid
- locale independence of Skill Intelligence
- existing Optimized CV integrity behavior
- existing Cover Letter factual-integrity behavior
- existing document-language/export behavior
- optional Cover Letter behavior
- existing Profile Match locale behavior
- existing photo/personal-information behavior where affected
- failure propagation and no fallback generation

Review existing tests and add only the regression/integration tests
needed to prove the above behavior.

Also inspect for:

- duplicated Skill Intelligence logic
- accidental Phase 6+ scope creep
- unintended changes to unrelated product behavior
- stale assumptions from the pre-Skill-Intelligence architecture

IMPORTANT:
Do not modify production code unless a concrete Phase 6 regression
is found and the fix is clearly required to satisfy the approved
specification.

If you find a production issue:

1. stop before modifying it
2. report the issue
3. identify the affected file/behavior
4. explain which specification requirement it violates
5. propose the minimal fix

Do not introduce:

- LangGraph
- RAG
- MCP
- multi-agent orchestration
- new persistence
- new APIs
- unrelated refactors

Run:

- full API test suite
- full web test suite
- typecheck
- lint
- build

Do not commit or merge anything.

FINAL REPORT

Return:

1. Phase 1–5 implementation audit
2. Regression tests added, if any
3. Full test results
4. Typecheck/lint/build results
5. Specification compliance
6. Any production issues found
7. Any remaining risks or limitations
8. Confirmation that no unrelated production code was changed
9. Final recommendation:
   - Ready to approve Phase 6
   - or Requires a specific fix before approval
