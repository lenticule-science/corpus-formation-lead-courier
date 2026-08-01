import { Message, Role } from "@a2a-js/sdk";
import { extractRmnPart, rmnPart } from "@red-cup-engineering/a2a-rmn-part-service";
import { decodeSemantic, semanticBytes, semanticId } from "@red-cup-engineering/rmn-semantic-conformance";
import { decodeRelationalValue } from "@red-cup-engineering/rmn-semantic-conformance/relational-value";
import { relationalWitnessJournalDocument } from "@lenticule-science/witness-journal-rdf-projection-service/client";
import { deliverCandidate } from "./deliver.mjs";
import { ACTOR } from "./service.mjs";
const record = (body) => Object.freeze({ id: semanticId(relationalWitnessJournalDocument(body)), ...body });
const decode = (bytes) => { const term = decodeSemantic(bytes); if (term?.[0] !== "ascribe") throw new Error("one typed RMN request required"); return decodeRelationalValue(term[1], term[2]); };
export async function executeA2aMessage(source, options = {}) {
  const message = Message.fromJSON(source); if (message.role !== Role.ROLE_USER) throw new Error("courier requires an A2A user message");
  const request = decode(extractRmnPart(message.parts).bytes);
  if (request?.type !== "CorpusFormationLeadDeliveryRequest" || request.provider !== ACTOR || !request.candidate || !Number.isSafeInteger(request.observedAtTick) || typeof request.recordedAt !== "string") throw new Error("exact courier-addressed delivery request required");
  const delivery = await (options.deliver ?? deliverCandidate)(request.candidate, { observedAtTick: request.observedAtTick, recordedAt: request.recordedAt });
  const receipt = record({ type: "CorpusFormationLeadDeliveryReceipt", provider: ACTOR, request: request.id, delivery, enterpriseFormationAuthorized: false, providerSelected: false, spendAuthorized: false, customerMutation: false });
  return Message.toJSON({ messageId: "", contextId: message.contextId ?? "", taskId: message.taskId ?? "", role: Role.ROLE_AGENT, parts: [rmnPart(semanticBytes(relationalWitnessJournalDocument(receipt)))], metadata: { outputNi: receipt.id }, extensions: [], referenceTaskIds: [] });
}
