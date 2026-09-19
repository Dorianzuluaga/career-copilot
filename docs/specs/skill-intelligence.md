# Skill Intelligence Specification

Document: docs/specs/skill-intelligence.md
Status: Approved Implementation-Ready Specification
Scope: Skill Intelligence / Skill Profile foundation
Implementation status: Not implemented

## 1. Purpose

Introduce a shared Skill Intelligence layer that transforms the candidate's existing Master CV skills into a structured, application-specific representation consumed by Optimized CV, Professional Summary, Cover Letter, and future career-intelligence features.

The layer determines:

what each existing skill represents;

its professional category;

its professional significance;

its relevance to the target application;

where the Master CV supports it;

which existing skills should receive greater emphasis.

Emphasis is expressed as semantic fields. The backend, not the LLM, assigns the final numeric priority.

The layer must not create candidate capabilities.

## 2. Core Principle — Master CV as Source of Truth

The Master CV is the sole source of truth for candidate skills.

Skill Intelligence may classify, normalize, categorize, determine professional weight, determine job relevance, and identify evidence already present in the Master CV.

The backend then deterministically assigns priority from those semantic fields.

It must never:

create a new candidate skill;

infer an unsupported technology;

convert a job requirement into a candidate skill;

use missingSkills as evidence of possession;

add a skill solely because it appears in Job Analysis;

copy a Profile Match matchingSkills value into sourceSkill;

fabricate evidence;

modify the Master CV;

replace a Master CV skill in generated documents with canonicalSkill.

Every Skill Profile item must map to a Master CV skill. Skill Intelligence may reason about skills, but it cannot introduce new candidate skills.

## 3. Problem Being Solved

The current application represents skills primarily as flat string arrays. Document generators independently reason about relevance from raw Master CV, Job Analysis, and Profile Match context.

This creates:

no structured classification;

no shared prioritization;

no evidence mapping;

no distinction between generic and professionally significant skills;

weak structural reuse of Profile Match reasoning;

no dedicated skill-priority context for Professional Summary;

no dedicated skill-priority context for Cover Letter;

inconsistent semantic skill representations;

no structural tie between narrative claims and the Master CV skill set.

Skill Intelligence addresses the shared skill-reasoning problem. It does not replace document generation, Job Analysis, or Profile Match.

## 4. Scope

In scope

Existing Master CV skills.

Classification and internal canonical representation.

Application-specific relevance.

Professional significance.

Evidence mapping to existing Master CV content.

Shared, deterministically derived prioritization.

Structured Skill Profile.

Backend process-scoped in-memory caching during Optimized CV and Cover Letter generation.

Out of scope

New candidate skills.

CV narrative generation.

Cover Letter generation.

Replacement of Profile Match or Job Analysis.

Public Skill Intelligence HTTP API.

Frontend Skill Intelligence cache.

Prisma / PostgreSQL Skill Profile persistence.

Locale, workingLanguage, presentation language, or translation of Skill Intelligence fields.

Automatic Profile Match regeneration.

Automatic Skill Intelligence retry.

Reverse-engineering user-added or manually edited Optimized CV skills.

RAG.

MCP.

LangGraph orchestration.

Multi-agent architecture.

External market research or labor-market data.

Automatic Master CV modification.

## 5. Inputs

Skill Intelligence operates on:

Master CV +
Job Analysis +
Profile Match

Optimized CV content, including user-edited Optimized CV skills, is not a Skill Intelligence input.

### 5.1 Master CV

The authoritative candidate skill inventory is:

masterCv.skills

The V1 Skill Profile must contain exactly one item for every distinct Master CV skill after the approved deterministic normalization defined in §14.

Omitting a distinct Master CV skill from the Skill Profile is a validation failure.

Other Master CV sections may be inspected only as evidence, and only through the curated payload in §38:

professional summary;

experience title, company, and description;

education degree, field, and description;

certification name and issuer;

languages;

personal-project name, description, and technologies.

If a technology appears only in an experience description but not in masterCv.skills, it may support an existing skill but must not automatically become a new SkillProfileItem.

### 5.2 Job Analysis

Used to determine application relevance.

Relevant inputs:

requiredSkills
atsKeywords
responsibilities
summary

Job Analysis must never become a source of candidate capabilities.

### 5.3 Profile Match

Provides application-level signals only:

matchingSkills
missingSkills
strengths
weaknesses
alignmentScore
alignmentReasoning
recommendation

matchingSkills is a signal, not an authoritative candidate skill inventory.

The implementation must never copy a Profile Match matchingSkills value into sourceSkill.

The existing Profile Match strings remain unstructured signals. Skill Intelligence may use them to determine jobRelevance. The backend then derives priority from the resulting semantic fields.

missingSkills may identify unsupported job requirements but must never become candidate skills.

Skill Intelligence must not silently regenerate Profile Match.

If Master CV changes while an existing Profile Match is still based on an older Master CV state, Skill Intelligence may use that saved Profile Match as a supporting signal. This V1 limitation is accepted and must not be “fixed” by triggering Profile Match generation from Skill Intelligence.

## 6. Skill Profile

Skill Intelligence produces:

type SkillProfile = {
skills: SkillProfileItem[]
}

Each item represents exactly one distinct existing Master CV skill after the approved deterministic normalization.

The Skill Profile is complete only when its distinct source skills are exactly the distinct Master CV skills. A subset is invalid.

## 7. SkillProfileItem Contract

type SkillProfileItem = {
sourceSkill: string
canonicalSkill: string
category: string
professionalWeight: ProfessionalWeight
jobRelevance: JobRelevance
priority: number
evidence: SkillEvidence[]
}

priority is assigned by deterministic backend logic after AI validation. The LLM must not return priority.

### 7.1 sourceSkill

The preserved Master CV skill string for this distinct normalized skill.

Rules:

it is taken from masterCv.skills;

it is the first trimmed occurrence of that distinct skill in Master CV order;

it is immutable within the Skill Profile;

it is the only user-facing and document-facing skill string.

Generated Optimized CV and Cover Letter content must use sourceSkill. The system must never replace a Master CV skill in generated documents with canonicalSkill.

### 7.2 canonicalSkill

Internal Skill Intelligence metadata only.

The LLM may supply AI-derived canonical terminology for internal semantic reasoning. This may normalize casing, punctuation, pluralization, common formatting variants, or confidently equivalent representations.

canonicalSkill must never:

merge genuinely different Master CV skills;

collapse React and React.js into one SkillProfileItem;

replace sourceSkill in documents;

authorize a new technology;

be used as the Optimized CV or Cover Letter skill list.

If equivalence is ambiguous, preserve the Master CV skills as separate items. Distinctness is determined only by §14.

## 8. Extensible Skill Taxonomy

The taxonomy is extensible and must not assume software development.

Examples:

Developer → Front-End / Back-End / Databases / AI & Automation / Development Tools
Lawyer → Legal / Compliance / Litigation
Designer → UX/UI / Visual Design / Design Tools

These are examples, not a closed taxonomy.

Do not introduce a closed universal category enum.

V1 requirements:

categories are data, not an exhaustive universal enum;

new professional domains require no SkillProfileItem contract change;

exactly one primary category per skill;

AI may propose a category;

runtime validation must validate the resulting taxonomy value using the rules below;

categories must not be created to justify invented skills.

V1 category validation:

non-empty after trim;

trimmed before storage;

maximum 80 Unicode characters after trim;

no newline, tab, or other Unicode control characters;

no instruction-like content, including role or prompt markers such as "system:", "developer:", "ignore previous", or fenced-code markers.

Within a single Skill Profile, the AI should reuse the exact same category string when the category is the same. V1 runtime does not fail the profile because two categories are near-duplicates such as "Front-End" and "Frontend". Near-duplicate avoidance is prompt guidance, not a deterministic requirement.

Future multiple-category support is out of scope.

## 9. Professional Weight

Professional Weight answers:

How significant is this skill as a professional capability?

Approved values:

type ProfessionalWeight =
| "core_professional"
| "specialized"
| "supporting"
| "general"

Definitions:

core_professional: central professional capability.

specialized: meaningful specialization or differentiating depth.

supporting: useful capability supporting professional work.

general: broad/common/foundational capability that should not automatically dominate positioning.

Professional Weight is candidate/profile-oriented and distinct from application relevance.

## 10. Job Relevance

Job Relevance answers:

How relevant is this existing candidate skill to this application?

Approved values:

type JobRelevance =
| "very_high"
| "high"
| "medium"
| "low"
| "none"

Definitions:

very_high: directly aligned with an important requirement/responsibility.

high: strongly relevant but not necessarily central.

medium: useful or related.

low: weakly related.

none: no meaningful relevance.

A skill may be core_professional + low or general + very_high. These values must not be conflated.

A skill with jobRelevance "none" remains in the Skill Profile and remains available to Optimized CV. Low or absent application relevance is not permission to omit the skill.

## 11. Priority

priority determines the order in which existing skills receive attention for the current application.

The LLM must not return the final numeric priority.

The LLM is responsible only for the semantic fields:

category

canonicalSkill

professionalWeight

jobRelevance

evidence

The backend deterministically derives priority after those fields are validated.

Rules:

lower number = higher priority;

starts at 1;

unique;

contiguous from 1 to N;

N equals the number of Skill Profile items, which equals the number of distinct Master CV skills after §14 normalization;

application-specific, because jobRelevance is application-specific;

only existing Master CV skills may receive priority.

Priority is an ordering signal, not an absolute quality score.

### 11.1 Deterministic ordering

Sort Skill Profile items by:

1. jobRelevance descending:
   very_high > high > medium > low > none

2. professionalWeight descending:
   core_professional > specialized > supporting > general

3. original Master CV skill index ascending as the stable tie-breaker

The original Master CV skill index is the index of the first masterCv.skills entry that produced that distinct item under §14.

After sorting, assign priority 1..N in that order.

This ordering is the only V1 priority algorithm. Document generators must consume these values and must not independently reconstruct priority from raw skill lists.

## 12. Evidence

Evidence answers:

Where in the Master CV is this skill supported?

type SkillEvidence = {
source: SkillEvidenceSource
reference: string
}

type SkillEvidenceSource =
| "professional_summary"
| "experience"
| "education"
| "certifications"
| "personal_projects"
| "languages"

Evidence may be an empty array. A Master CV skill that appears only in masterCv.skills and is not referenced elsewhere may have no evidence.

### 12.1 Closed reference grammar

V1 evidence references use only these structural references:

| source | reference |
|---|---|
| professional_summary | professionalSummary |
| experience | experience[i] |
| education | education[i] |
| certifications | certifications[i] |
| personal_projects | personalProjects[i] |
| languages | languages[i] |

i is a non-negative integer.

Examples:

{"source":"experience","reference":"experience[0]"}

{"source":"personal_projects","reference":"personalProjects[1]"}

{"source":"professional_summary","reference":"professionalSummary"}

No other source or reference format is valid.

### 12.2 Structural validation

Evidence validation is structural in V1:

source must be one of the approved SkillEvidenceSource values;

reference must match the exact format for that source;

professionalSummary exists as a Master CV field;

for indexed references, the target array exists and i is in range;

source and reference must agree, for example source "experience" cannot use "education[0]".

Semantic determination of whether the referenced content genuinely supports the skill is an AI responsibility. V1 runtime does not reject structurally valid evidence because the text does not mention the skill.

Evidence must never be fabricated as a Skill Profile item or as a reference to a non-existent structure.

## 13. Evidence Semantics

Evidence is not itself a new skill source.

Valid:

Master CV skill: React
Experience[0]: "Developed interfaces using React."
→ React evidence = {"source":"experience","reference":"experience[0]"}

Also valid:

Master CV skill: Git
Git appears only in masterCv.skills
→ Git evidence = []

Invalid:

Experience mentions Docker
Master CV skills does not contain Docker
→ create Docker SkillProfileItem

The second behavior is prohibited in V1.

## 14. Source-of-Truth Validation

Before accepting an AI-generated Skill Profile, every sourceSkill must resolve to the deterministic Master CV skill inventory.

### 14.1 Approved deterministic normalization

V1 deterministic skill normalization is limited to:

1. trimming surrounding whitespace;
2. Unicode case-folding to produce a comparison key.

Do not automatically merge semantic variants. React and React.js remain distinct Skill Profile items because they are not identical after this normalization.

Ambiguous equivalence must not be silently accepted.

sourceSkill matching against the provided inventory uses this normalization only as a fail-closed check. The AI must return the exact sourceSkill strings from the provided inventory. Rewriting sourceSkill to canonicalSkill is a validation failure.

### 14.2 Distinct inventory and duplicate Master CV skills

Build the inventory by walking masterCv.skills in order:

trim each skill;

ignore empty strings, which Master CV validation already rejects;

compute the comparison key;

if the key has not been seen, keep that trimmed original string as sourceSkill and record its original Master CV index;

if the key has already been seen, discard the later occurrence as a duplicate. Do not create another SkillProfileItem.

The implementation must not silently create duplicate Skill Profile items for skills that become identical after this normalization.

Example:

masterCv.skills = ["React", "react", "React.js"]

produces two inventory items:

sourceSkill "React" at original index 0

sourceSkill "React.js" at original index 2

"react" is a duplicate of "React" and must not receive its own item.

Omitting React or React.js from the Skill Profile is a validation failure.

### 14.3 Completeness

The accepted Skill Profile must contain exactly the inventory from §14.2:

every inventory sourceSkill is present exactly once;

no extra sourceSkill is present;

no Profile Match matchingSkills value was copied into sourceSkill.

## 15. Profile Match Relationship

Skill Intelligence does not replace Profile Match.

Master CV + Job Analysis
↓
Profile Match
↓
Skill Intelligence

Profile Match matchingSkills may inform jobRelevance, but cannot authorize a skill absent from the Master CV.

The implementation must never copy matchingSkills into sourceSkill.

missingSkills may identify unsupported job requirements but must never become candidate skills.

Skill Intelligence must use the persisted Profile Match. It must not call Profile Match generation, presentation, or adaptation.

If Master CV later changes, the saved Profile Match may be stale. Skill Intelligence still uses that saved Profile Match as a supporting signal. Cache invalidation from the new Master CV fingerprint causes Skill Intelligence to recompute; it does not regenerate Profile Match.

## 16. Deterministic Responsibilities

Application code owns:

Master CV source-of-truth enforcement;

deterministic normalization and distinct-inventory construction;

allowlisting;

deduplication of normalized Master CV skills;

preservation of sourceSkill;

Skill Profile structural validation;

completeness validation;

deterministic priority assignment;

priority uniqueness/continuity as a consequence of that assignment;

evidence reference grammar and bounds validation;

caching lifecycle;

source fingerprint and skillProfileContractVersion;

schema validation;

rejection of unknown skills;

taxonomy structural validation;

protection against candidate-skill invention;

fail-closed generation when Skill Intelligence is invalid.

These responsibilities must not be delegated exclusively to the LLM.

## 17. AI Responsibilities

An LLM may assist only with:

category;

canonicalSkill;

professionalWeight;

jobRelevance;

semantic interpretation of job requirements and Profile Match signals;

evidence interpretation.

The AI must not return priority.

The AI is a reasoning component, not the source of truth.

## 18. Skill Intelligence AI Contract

Skill Intelligence V1 is locale-independent.

The AI call must not receive:

generation locale;

workingLanguage;

presentation language;

translation instructions.

Skill Intelligence describes skills and evidence independently of document language. Do not apply generationLanguageInstruction to this call.

### 18.1 Curated payload

The AI call receives only:

the deterministic Master CV skill inventory from §14.2;

the curated Master CV evidence context from §38;

Job Analysis requiredSkills, atsKeywords, responsibilities, and summary;

Profile Match signals from §5.3.

It must not receive Optimized CV data.

### 18.2 AI output

The AI returns structured semantic Skill Profile data only:

type SkillProfileAiOutput = {
skills: {
sourceSkill: string
canonicalSkill: string
category: string
professionalWeight: ProfessionalWeight
jobRelevance: JobRelevance
evidence: SkillEvidence[]
}[]
}

The AI output schema is part of this contract. It must use additionalProperties: false and must not include priority.

The backend then:

validates the output;

enforces source-of-truth and completeness;

validates evidence and taxonomy;

assigns priority with §11.1;

produces the SkillProfile consumed by generators.

The AI must not return:

priority;

CV prose;

Cover Letter prose;

new candidate skills;

unsupported evidence references;

arbitrary additional fields.

## 19. Downstream Consumers

Optimized CV

Uses Skill Profile to determine:

skills to emphasize;

skills influencing Professional Summary;

skills influencing experience/project descriptions;

skill ordering by the backend-assigned priority.

Optimized CV must continue to include all Master CV source skills represented in the Skill Profile. Skills may be reordered by priority. No distinct Master CV skill may be omitted because its jobRelevance is low or none.

Document-facing skill strings must be sourceSkill, never canonicalSkill.

The existing supportedSkills integrity function remains a deterministic Master CV allowlist. It is not a priority fallback and must not be used to invent a Skill Profile when Skill Intelligence fails.

The Optimized CV generator remains responsible for document structure, narrative, one-page considerations, descriptions, project selection, and final output.

Professional Summary

Remains part of Optimized CV generation. It is not a separate agent in V1.

The Optimized CV generation call must receive the Skill Profile so Professional Summary can use the shared skill reasoning. It must not independently reconstruct skill priority from raw lists.

Cover Letter

Consumes the same Skill Profile and remains responsible for greeting, introduction, professional value, motivation, closing, factual narrative, and complementarity with the Optimized CV.

Once Skill Intelligence is integrated into Optimized CV and Cover Letter generation, both generators must consume that Skill Profile. They must not independently reconstruct skill priority from raw lists.

User-added or manually edited Optimized CV skills are outside Skill Intelligence V1.

Existing Optimized CV save and edit behavior remains unchanged.

Skill Intelligence operates from Master CV + Job Analysis + Profile Match. It does not read, validate, or reverse-engineer manual Optimized CV skill edits.

## 20. Shared Skill Reasoning

The same Skill Profile is reusable by Optimized CV and Cover Letter so that skill priority does not diverge due to independent LLM interpretation.

Priority cannot diverge because of LLM ordering: both consumers receive the backend-assigned priority from one Skill Profile.

If the process cache is lost, the Skill Profile is recomputed from the same sources and the same deterministic priority algorithm. Semantic fields may still vary if the AI call is repeated. That is accepted V1 behavior for a cache miss after restart or on another instance. The implementation must not invent a fallback Skill Profile to avoid that recompute.

## 21. Persistence Strategy — V1

The Skill Profile will not be persisted in PostgreSQL or Prisma in V1.

It will be held in a backend process-scoped in-memory cache.

The cache is a derived optimization, not a source of truth.

The cache is:

lazy;

internal;

not exposed through a public API;

not implemented as a frontend cache.

Authoritative sources remain:

Master CV;

Job Analysis;

Profile Match.

If the cache is lost, the Skill Profile is recomputed when next required.

## 22. Cache Scope

The cache is populated lazily when Optimized CV or Cover Letter generation requires a Skill Profile.

Cache identity must include:

userId

applicationId

source fingerprint

skillProfileContractVersion

The cache must not be global across users or applications. A Skill Profile from Application A must never be reused for Application B. A Skill Profile computed for one user must never be reused for another user.

Lookup occurs only after application ownership authorization.

### 22.1 Source fingerprint

The source fingerprint must be generated from a canonical JSON representation of the Skill Intelligence inputs plus skillProfileContractVersion.

Fingerprint inputs are exactly the Skill Intelligence inputs:

the curated Master CV payload defined in §38, including skills;

Job Analysis requiredSkills, atsKeywords, responsibilities, and summary;

Profile Match matchingSkills, missingSkills, strengths, weaknesses, alignmentScore, alignmentReasoning, and recommendation;

skillProfileContractVersion.

Do not include email, phone, location, links, profile photo, or other excluded personal fields in the fingerprint.

skillProfileContractVersion is an implementation constant. V1 starts at 1. Increment it when the Skill Intelligence contract, AI schema, prompt, normalization, priority algorithm, or fingerprint input set changes.

A process restart or a different backend instance may recompute the Skill Profile. Cross-instance persistence is not required in V1.

## 23. Cache Invalidation

The cached Skill Profile becomes invalid when the cache identity changes. In practice that happens when any fingerprint input changes:

relevant Master CV skill or evidence fields;

relevant Job Analysis fields;

persisted Profile Match fields;

skillProfileContractVersion.

Invalid cached data must not be silently reused. The Skill Profile is recomputed when next required.

User edits to generated Optimized CV or Cover Letter do not invalidate Skill Intelligence, because those documents are downstream consumers and are not Skill Intelligence inputs.

Skill Intelligence cache invalidation must not silently regenerate Profile Match.

## 24. Cache Failure and Fail-Closed Generation

If the cache is unavailable or lost:

no incorrect Skill Profile may be used;

the application must recompute the Skill Profile.

Recompute failure is a generation failure.

Once Skill Intelligence is integrated into Optimized CV and Cover Letter generation, Skill Intelligence is a required dependency.

If Skill Intelligence fails:

Optimized CV or Cover Letter generation must fail;

no fallback Skill Profile may be silently created;

generators must not silently fall back to independent raw-skill priority reasoning;

supportedSkills remains a deterministic integrity allowlist, not a priority fallback;

the existing user-triggered retry behavior remains;

no automatic retry is introduced.

Use the existing API and domain error-handling conventions: a domain error with statusCode, returned through the existing error response mapper as `{ message }`.

## 25. No Master CV Mutation

Skill Intelligence is read-only with respect to Master CV. It must never add, remove, rename, or reorder Master CV skills, or modify experience, projects, education, or certifications.

Reordering skills in the Skill Profile or in a generated Optimized CV does not mutate the Master CV.

## 26. Taxonomy Governance

V1:

one primary category per skill;

category names are structured data;

category values are validated with the §8 rules;

categories are reusable when semantically appropriate;

the AI should avoid unnecessary near-duplicate categories;

near-duplicate detection is not a deterministic V1 requirement.

Future taxonomy versioning, hierarchy, multiple memberships, administrator-managed taxonomies, and profession-specific taxonomies are out of scope.

## 27. Generic vs Specialized Skills

Professional Weight addresses the distinction between broad/common skills and stronger professional differentiators.

Examples:

Git → general or supporting
React → core_professional
LLM Integration → specialized or core_professional
PostgreSQL → core_professional or supporting depending on candidate context

The value is determined from candidate context, not a universal hard-coded ranking.

Professional Weight must not be interpreted as market popularity.

## 28. Job Relevance vs Market Value

V1 does not use external market data.

The system must distinguish:

professionalWeight

from:

jobRelevance

It must not claim that a skill has higher market demand unless a future feature explicitly introduces an external data source.

## 29. No RAG

RAG is not required for V1. Inputs are already available as structured application data. There is no requirement to retrieve external knowledge.

A future market-intelligence feature may justify RAG separately. Do not introduce RAG in this implementation.

## 30. No MCP

MCP is not required for V1. Skill Intelligence does not require external tools or systems.

A future feature may introduce MCP if agents need access to external systems or tools. Do not introduce MCP in this implementation.

## 31. No LangGraph Requirement

Skill Intelligence does not require LangGraph in V1.

The first implementation must be expressible as:

Authorize application ownership
↓
Load Master CV, Job Analysis, and persisted Profile Match
↓
Deterministic preprocessing and curated payload
↓
Source fingerprint + cache lookup
↓
On miss: Skill Intelligence reasoning
↓
Structured output validation
↓
Deterministic source-of-truth, completeness, evidence, and taxonomy validation
↓
Deterministic priority assignment
↓
Skill Profile
↓
Store in backend process cache

LangGraph may be introduced only if a later approved requirement introduces branching, conditional execution, iterative refinement, validation-driven retries, persistent workflow state, multiple specialized agents, or tool orchestration.

Do not introduce LangGraph for Skill Intelligence V1.

## 32. No Multi-Agent Requirement

V1 does not require separate:

Skill Classification Agent;

Skill Prioritization Agent;

Evidence Agent;

Summary Agent;

Cover Letter Agent;

Critic Agent.

Skill Intelligence is one coherent capability: one AI call for semantic fields, then deterministic validation, priority, and cache.

## 33. Future Architectural Evolution

MASTER CV
SOURCE OF TRUTH
↓
PROFILE / JOB DATA
↓
SKILL INTELLIGENCE
↓
SKILL PROFILE
↓
┌──────────────┬──────────────┬─────────────────┐
Optimized CV Cover Letter Future Features
├─ Interview Prep
├─ Skill Gap Analysis
├─ Career Positioning
├─ Job Matching
└─ Learning Recommendations

Future consumers are not V1 implementation scope.

LangGraph, RAG, MCP, and multi-agent orchestration remain future evolution only. They are not part of this implementation.

## 34. Example

Given Master CV skills, in order:

React
TypeScript
Node.js
PostgreSQL
Git
LLM Integration
Prompt Engineering

and Job Analysis required skills:

React
TypeScript
Node.js
AI integrations
REST APIs

Skill Intelligence must produce one item for every distinct Master CV skill. REST APIs must not become a Skill Profile item.

The LLM returns semantic fields only. After validation, the backend assigns priority with §11.1. One valid result is:

{
"skills": [
{
"sourceSkill": "React",
"canonicalSkill": "React",
"category": "Front-End",
"professionalWeight": "core_professional",
"jobRelevance": "very_high",
"priority": 1,
"evidence": [
{
"source": "experience",
"reference": "experience[0]"
}
]
},
{
"sourceSkill": "TypeScript",
"canonicalSkill": "TypeScript",
"category": "Front-End",
"professionalWeight": "core_professional",
"jobRelevance": "very_high",
"priority": 2,
"evidence": [
{
"source": "experience",
"reference": "experience[0]"
}
]
},
{
"sourceSkill": "Node.js",
"canonicalSkill": "Node.js",
"category": "Back-End",
"professionalWeight": "core_professional",
"jobRelevance": "very_high",
"priority": 3,
"evidence": []
},
{
"sourceSkill": "LLM Integration",
"canonicalSkill": "LLM Integration",
"category": "AI & Automation",
"professionalWeight": "specialized",
"jobRelevance": "very_high",
"priority": 4,
"evidence": [
{
"source": "personal_projects",
"reference": "personalProjects[0]"
}
]
},
{
"sourceSkill": "Prompt Engineering",
"canonicalSkill": "Prompt Engineering",
"category": "AI & Automation",
"professionalWeight": "specialized",
"jobRelevance": "very_high",
"priority": 5,
"evidence": [
{
"source": "personal_projects",
"reference": "personalProjects[0]"
}
]
},
{
"sourceSkill": "PostgreSQL",
"canonicalSkill": "PostgreSQL",
"category": "Databases",
"professionalWeight": "supporting",
"jobRelevance": "medium",
"priority": 6,
"evidence": []
},
{
"sourceSkill": "Git",
"canonicalSkill": "Git",
"category": "Development Tools",
"professionalWeight": "general",
"jobRelevance": "none",
"priority": 7,
"evidence": []
}
]
}

Priority explanation for this example:

very_high + core_professional, Master CV index order: React, TypeScript, Node.js → 1, 2, 3

very_high + specialized, Master CV index order: LLM Integration, Prompt Engineering → 4, 5

medium + supporting: PostgreSQL → 6

none + general: Git → 7

Git remains in the Skill Profile and must remain available to Optimized CV.

If the Master CV had also contained "react", that string would not produce an eighth item. sourceSkill would remain "React".

## 35. Validation Invariants

Before accepting a Skill Profile:

the distinct inventory from §14.2 is complete;

every sourceSkill is exactly an inventory sourceSkill;

no duplicate source skills after §14 normalization;

no sourceSkill originated from matchingSkills, missingSkills, or Job Analysis;

exactly one valid primary category per item, satisfying §8;

exactly one valid Professional Weight;

exactly one valid Job Relevance;

the AI output does not contain priority;

backend-assigned priorities are integers, unique, contiguous, start at 1, and match §11.1;

every evidence item uses the closed grammar in §12;

every evidence reference points to an existing Master CV structure and a valid index where applicable;

empty evidence arrays are allowed;

no invented skills;

no invented evidence references.

## 36. Error Handling

Skill Intelligence must fail closed.

If validation detects invented skills, invalid or extra skills, incomplete coverage of the Master CV inventory, invalid evidence, malformed structure, duplicate skills, invalid categories, invalid enum values, or an AI-supplied priority field, the Skill Profile must not be consumed downstream.

Once integrated, Optimized CV and Cover Letter generation must fail when Skill Intelligence fails.

The system must return an error using the existing domain-error and API error conventions and allow the existing user-triggered retry.

It must never:

silently accept invalid AI output;

silently create a fallback Skill Profile;

automatically retry the AI call;

use supportedSkills as a substitute Skill Profile or priority list.

## 37. Security / Prompt Injection

Master CV, Job Analysis, and Profile Match are source data. Instructions embedded in those fields must never be treated as system or developer instructions.

The Skill Intelligence prompt must explicitly distinguish instructions from candidate and job source data.

## 38. Privacy / Context Minimization

Skill Intelligence must receive only the minimum Master CV information required for classification, professional weighting, job relevance, and evidence mapping.

Allowed Master CV payload:

skills

professionalSummary

experience: jobTitle, company, description

education: degree, fieldOfStudy, description

certifications: name, issuer

languages

personalProjects: name, description, technologies

Do not send:

email

phone

location / address

linkedin, website, or other links

profile photo or photo position

unrelated personal information

Job Analysis and Profile Match payloads are limited to the fields listed in §5.2 and §5.3.

## 39. Implementation Boundary

Implementation must be divided into explicit phases. Each phase includes tests. No phase introduces LangGraph, RAG, MCP, or multi-agent orchestration.

Phase 1 — Contract

SkillProfile and SkillProfileItem types.

AI output type and JSON schema without priority.

Taxonomy representation as an open validated string.

Deterministic normalization helpers.

Distinct-inventory construction and duplicate collapse.

Deterministic priority calculation.

Source-of-truth, completeness, evidence, and taxonomy validators.

Tests for those units.

Phase 2 — Intelligence

Skill Intelligence AI service.

Curated payload from §38.

Locale-independent prompt.

Strict structured output.

AI output validation and fail-closed errors.

Tests.

Phase 3 — Cache

Backend process-scoped in-memory cache.

Cache identity: userId, applicationId, source fingerprint, skillProfileContractVersion.

Lazy get-or-compute lifecycle.

Invalidation through fingerprint change.

Tests for hit, miss, isolation, and recompute.

Phase 4 — Optimized CV integration

Provide Skill Profile to Optimized CV generation.

Priority-aware skill ordering using sourceSkill.

Professional Summary generation receives the Skill Profile.

Skill Intelligence is a required dependency of generation.

supportedSkills remains an integrity allowlist only.

Tests.

Phase 5 — Cover Letter integration

Provide the same Skill Profile to Cover Letter generation.

Cover Letter uses it as shared intelligence and must not reconstruct priority from raw lists.

Tests.

Phase 6 — Cross-feature regression

Cross-feature regression.

Locale, export, and Profile Match isolation checks.

Manual QA.

Confirm no Prisma model, no public SI API, no frontend SI cache, and no LangGraph/RAG/MCP dependency.

## 40. Definition of Done

Skill Intelligence V1 is complete when:

a structured Skill Profile exists;

the profile contains exactly one item for every distinct Master CV skill after §14 normalization;

every item is grounded in Master CV skills;

sourceSkill is the document-facing skill string;

canonicalSkill is internal only;

taxonomy is extensible and validated with the §8 rules;

Professional Weight uses core_professional, specialized, supporting, general;

Job Relevance uses very_high, high, medium, low, none;

evidence references use the closed grammar and are structurally validated;

empty evidence is allowed;

the LLM does not assign priority;

priority is derived with §11.1 and validated;

Profile Match is used as a signal and never copied into sourceSkill;

stale persisted Profile Match may be used without regenerating Profile Match;

Skill Profile is cached in a backend process-scoped store;

cache identity includes userId, applicationId, source fingerprint, and skillProfileContractVersion;

cache invalidation is defined and tested;

Optimized CV consumes the Skill Profile and still includes all distinct Master CV source skills;

Cover Letter consumes the same Skill Profile;

Skill Intelligence is a required generation dependency after integration;

no fallback Skill Profile is created on failure;

no new candidate skills can be introduced;

no Master CV mutation occurs;

user-edited Optimized CV skills remain outside this feature;

Skill Intelligence is locale-independent;

existing save/edit behavior remains compatible;

tests and type checking pass;

no LangGraph, RAG, MCP, or multi-agent dependency is introduced.

## 41. Architectural Principle

                    MASTER CV
                 SOURCE OF TRUTH
                        │
                        ▼
                PROFILE MATCH
                        │
                        ▼
               SKILL INTELLIGENCE
                        │
                 SKILL PROFILE
                        │
              ┌─────────┴─────────┐
              ▼                   ▼

    OPTIMIZED CV COVER LETTER

Skill Intelligence is a shared structured intelligence layer, not another text generator.

The LLM provides semantic reasoning.

Deterministic application code provides source-of-truth enforcement, validation, priority, and cache.

Document generators consume the resulting structured context and display sourceSkill.

Workflow orchestration technologies are introduced only when actual workflow complexity requires them. They are not required for V1.
