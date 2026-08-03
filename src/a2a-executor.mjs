import { Message, Role } from "@a2a-js/sdk";
import { extractRmnPart, rmnPart } from "@red-cup-engineering/a2a-rmn-part-service";
import { deliverCandidate } from "./deliver.mjs";
import { ACTOR } from "./service.mjs";
import { admit, identify } from "./semantic-content.mjs";
const KIND = "corpus-formation-lead-courier.operation";
const record = (body) => Object.freeze({ id: identify(body, KIND).id, ...body });
const decode = (bytes) => admit(bytes, KIND);
export async function executeA2aMessage(source, options = {}) {
  const message = Message.fromJSON(source); if (message.role !== Role.ROLE_USER) throw new Error("courier requires an A2A user message");
  const request = decode(extractRmnPart(message.parts).bytes);
  if (request?.type !== "CorpusFormationLeadDeliveryRequest" || request.provider !== ACTOR || !request.candidate || !Number.isSafeInteger(request.observedAtTick) || typeof request.recordedAt !== "string") throw new Error("exact courier-addressed delivery request required");
  const delivery = await (options.deliver ?? deliverCandidate)(request.candidate, { observedAtTick: request.observedAtTick, recordedAt: request.recordedAt });
  const receipt = record({ type: "CorpusFormationLeadDeliveryReceipt", provider: ACTOR, request: request.id, delivery, enterpriseFormationAuthorized: false, providerSelected: false, spendAuthorized: false, customerMutation: false });
  return Message.toJSON({ messageId: "", contextId: message.contextId ?? "", taskId: message.taskId ?? "", role: Role.ROLE_AGENT, parts: [rmnPart(identify(receipt, KIND).bytes)], metadata: { outputNi: receipt.id }, extensions: [], referenceTaskIds: [] });
}
