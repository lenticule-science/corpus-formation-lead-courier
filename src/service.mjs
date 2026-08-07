import { identify } from "./semantic-content.mjs";

export const ACTOR = "urn:ame:corpus-formation-lead-courier";
export const FOUNDER = "urn:ame:561-group:founder-enterprise-formation-demand-service";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const NI = /^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/u;
const record = (body) => Object.freeze({ id: identify(body, "corpus-formation-lead-courier.record").id, ...body });

// A courier is a membrane, not a founder: it can only preserve a bounded
// candidate's evidence and address it to the standing founder receiver.
export function projectFounderFormationLead(candidate, { observedAtTick, recordedAt }) {
  if (candidate?.type !== "FounderEnterpriseFormationMarketLeadCandidate" || candidate.supplier !== "urn:ame:corpus-management-team") throw new Error("exact corpus formation-lead candidate required");
  if (!NI.test(candidate.sourceGap ?? "") || !Array.isArray(candidate.requiredCapabilities) || !candidate.requiredCapabilities.length || !Number.isSafeInteger(observedAtTick) || observedAtTick < 0 || !Number.isFinite(Date.parse(recordedAt))) throw new Error("bounded candidate evidence and externally supplied tick required");
  const lead = record({ type: "FounderEnterpriseFormationMarketLead", supplier: ACTOR, sourceActivity: candidate.candidateId, sourceGap: candidate.sourceGap, customer: candidate.customer, lot: candidate.lot, observedAtTick, recordedAt, requiredCapabilities: candidate.requiredCapabilities, missingCapabilities: candidate.missingCapabilities, maximumCustomerBounty: candidate.maximumCustomerBounty, founderAudience: { settlement: "561-group", office: "founder" }, receiverNecessityClaimed: false, founderDecisionRequired: true, enterpriseFormationAuthorized: false, enterpriseFormed: false, formationProviderPreselected: false, customerCreatedSupplier: false, customerMutation: false, strongerModelAuthorized: false, nextBoundary: "founder-authored-enterprise-formation-demand-or-refusal" });
  return record({ "@context": CONTEXT, type: "Create", actor: ACTOR, target: FOUNDER, object: lead });
}
