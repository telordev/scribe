// OpenAI Codex delegation provider (Chat Completions API).
//
// A `provider` plugin exports `delegate`: it reads `{task, system, model,
// apiKey}` from the host, calls the vendor API via `host.fetch`, and writes the
// answer back mcp-style (`{content:[{type:"text",text}]}`). The host resolves
// `apiKey` from OPENAI_API_KEY and passes it in — the wasm never reads env.
//
// Build to wasm with: extism-js plugin.js -i plugin.d.ts -o plugin.wasm
// (or let the CLI compile plugin.js on the fly when plugin.wasm is absent).

function out(text) {
	Host.outputString(
		JSON.stringify({ content: [{ type: "text", text: String(text) }] }),
	);
}

function fail(msg) {
	host.log("error", msg);
	Host.outputString(
		JSON.stringify({ content: [{ type: "text", text: msg }], isError: true }),
	);
	return 0;
}

function delegate() {
	const input = JSON.parse(Host.inputString() || "{}");
	const task = String(input.task || "");
	const apiKey = input.apiKey;
	const model = input.model || "gpt-5-codex";
	if (!apiKey) {
		return fail("codex: missing API key (set OPENAI_API_KEY)");
	}

	const messages = [];
	if (input.system) {
		messages.push({ role: "system", content: String(input.system) });
	}
	messages.push({ role: "user", content: task });

	const res = host.fetch({
		url: "https://api.openai.com/v1/chat/completions",
		method: "POST",
		headers: {
			authorization: "Bearer " + apiKey,
			"content-type": "application/json",
		},
		body: JSON.stringify({ model: model, messages: messages }),
	});

	if (!res || res.status < 200 || res.status >= 300) {
		return fail(
			"codex: HTTP " + (res ? res.status : "?") + ": " + (res ? res.body : ""),
		);
	}

	let data;
	try {
		data = JSON.parse(res.body || "{}");
	} catch (e) {
		return fail("codex: malformed response: " + res.body);
	}

	const choice = (data.choices || [])[0] || {};
	const text = choice.message ? choice.message.content : "";
	out(text || res.body);
	return 0;
}

module.exports = { delegate };
