# Project Context

> Ubiquitous language for this project. Read by agents at the start of every session, alongside `AGENTS.md`.
> Pattern inspired by Matt Pocock's CONTEXT.md / domain-driven design.



# CONTEXT.md

## What this project is

This project is a lightweight, AI-powered information and command center built specifically for working parents in Hong Kong. It exists to solve the cognitive load of managing multiple children's logistics by consolidating scattered communications from family WhatsApp groups, helper chats, school apps (like eClass and Google Classroom), and physical school handbooks. By providing a unified dashboard, parents can seamlessly track daily routines—from uniform and breakfast preparation to after-school extra-curricular activities (ECAs) and tutor schedules. 

The platform is designed to transition family coordination from a manual, fragmented puzzle into a proactive hub. It features real-time status updates (e.g., helpers tapping "arrived at school" or tutors reporting delays) and automated scheduling alerts, ensuring that parents are never caught off-guard. Ultimately, it gives working parents peace of mind by offering full visibility over their kids' daily logistics and eliminating the anxiety of information misalignment among stakeholders.

## Glossary

| Term | Meaning |
|---|---|
| Command Center | The unified dashboard displaying real-time schedules, alerts, and statuses across all children and logistics providers. |
| Stakeholder | Any individual involved in the child's daily routine, including parents, helpers, grandparents, tutors, and drivers. |
| ECA | Extra-Curricular Activities; classes or events occurring outside regular school hours. |
| Handshake | A real-time status update or confirmation (e.g., "arrived at school", "picked up") logged by a stakeholder. |
| Consolidation | The process of aggregating schedules and messages from disparate sources (WhatsApp, eClass, handbook) into one view. |

## Key user journeys

1. **Morning prep overview:** A parent checks the unified dashboard to quickly verify required uniforms, packed snacks, and specific ECA equipment for all children based on aggregated school data.
2. **Real-time transit handshake:** A helper or grandparent logs a one-tap "picked up" or "arrived" status, instantly updating the parent's live feed and eliminating anxious WhatsApp check-ins.
3. **Automated schedule aggregation:** The AI agent automatically ingests and consolidates updates from eClass, Google Classroom, and physical handbooks into a single trackable homework and exam calendar.
4. **Ad-hoc schedule adjustment:** A tutor inputs a last-minute delay or cancellation, which immediately updates the centralized schedule and pushes alerts to all affected stakeholders.
5. **Proactive AI alerting:** The system proactively alerts parents about upcoming scheduling conflicts or missing transit handshakes to ensure no child is left waiting due to information misalignment.

## Tech stack

- Runtime: Node.js
- Language(s): TypeScript
- Framework(s): Next.js (Frontend WebView) and NestJS (Backend API)
- Datastore: PostgreSQL (via Supabase)
- Hosting: Vercel (Frontend) and Zeabur (Backend/Agent Orchestration)
- AI & Orchestration: Hermes Agent Framework (MiniMax M2.7 & Qwen3.6-Plus)
- Observability: Playwright (for automated QA/testing)

## Key constraints

- **Data Privacy & Access Control:** Strict isolation of family data (children's locations, photos, schedules). Must implement Role-Based Access Control (RBAC) so helpers, grandparents, and tutors only see the information relevant to their roles. No third-party LLM training on personal data.
- **Latency Budget:** Real-time transit "handshakes" (e.g., "picked up") and emergency alerts must appear on the parent's dashboard in under 5 seconds. AI processing for schedule ingestion can be asynchronous.
- **Cost Management:** Strict AI token cost ceiling. Must heavily utilize intelligent model routing (e.g., relying on fast, cheap orchestration models like MiniMax M2.7) to avoid runaway LLM API bills for continuous background schedule parsing.
- **Mobile-First Accessibility:** The Next.js WebView must be highly responsive and lightweight, as the primary device for parents, helpers, and grandparents will be mobile phones on cellular networks.
- **Multilingual & Contextual Parsing:** The system must accurately ingest and display information across English and Traditional Chinese, handling Hong Kong-specific conversational contexts (e.g., mixed Cantonese-English WhatsApp messages).



## Decisions log

<!-- Pointer to ADRs. Architecture decisions live in docs/adr/. -->

See `docs/adr/` for architectural decisions.
