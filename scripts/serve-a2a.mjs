#!/usr/bin/env node
import { resolve } from "node:path";
import { serveContractedAgent } from "@red-cup-engineering/a2a-contracted-agent-service";
const root = resolve(import.meta.dirname, "..");
serveContractedAgent({ port: Number(process.env.PORT ?? "8821"), host: process.env.HOST ?? "127.0.0.1", baseUrl: process.env.BASE_URL, agentCard: resolve(root, "content/agent-cards/corpus-formation-lead-courier.json"), executor: process.execPath, executorArgs: [resolve(root, "scripts/execute-a2a-message.mjs")] }).then(({ server }) => { const stop = () => server.close(() => process.exit(0)); process.once("SIGINT", stop); process.once("SIGTERM", stop); }).catch((error) => { process.stderr.write(`${error.stack ?? error}\n`); process.exitCode = 1; });
