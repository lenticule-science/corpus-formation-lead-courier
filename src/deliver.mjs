#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { deliverFromEnvironment } from "@red-cup-engineering/activitypub-services-section/deliver";
import { projectRmnActivity } from "@red-cup-engineering/activitypub-services-section/rmn-activity";
import { semanticBytes } from "@red-cup-engineering/rmn-semantic-conformance";
import { relationalWitnessJournalDocument } from "@lenticule-science/witness-journal-rdf-projection-service/client";
import { projectFounderFormationLead } from "./service.mjs";

function required(name) { const value = process.env[name]; if (!value) throw new Error(`${name} is required`); return value; }
export async function deliverCandidate(candidate, options = {}) {
  const recordedAt = options.recordedAt ?? required("FORMATION_LEAD_RECORDED_AT");
  const observedAtTick = Number(options.observedAtTick ?? required("FORMATION_LEAD_OBSERVED_AT_TICK"));
  const origin = options.origin ?? required("ACTIVITYPUB_ORIGIN");
  const identifier = options.identifier ?? required("ACTIVITYPUB_IDENTIFIER");
  const recipient = options.recipient ?? required("ACTIVITYPUB_RECIPIENT");
  const inbox = options.inbox ?? required("ACTIVITYPUB_RECIPIENT_INBOX");
  const agentCard = options.agentCard ?? required("ACTIVITYPUB_AGENT_CARD");
  const lead = projectFounderFormationLead(candidate, { observedAtTick, recordedAt });
  const activity = projectRmnActivity({ type: "Create", origin, identifier, recipient, agentCard, objectBytes: semanticBytes(relationalWitnessJournalDocument(lead)) });
  return deliverFromEnvironment(activity, { ...options, origin, identifier, recipient, inbox });
}
if (import.meta.url === `file://${process.argv[1]}`) deliverCandidate(JSON.parse(readFileSync(0, "utf8"))).then((receipt) => process.stdout.write(`${JSON.stringify(receipt)}\n`)).catch((error) => { process.stderr.write(`${error.stack ?? error}\n`); process.exitCode = 1; });
