// Anthropic Claude delegation provider (Messages API).
//
// A `provider` plugin exports `delegate`: it reads `{task, system, model,
// apiKey}` from the host, calls the vendor API via `host.fetch`, and writes the
// answer back mcp-style (`{content:[{type:"text",text}]}`). The host resolves
// `apiKey` from ANTHROPIC_API_KEY and passes it in — the wasm never reads env.
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
	const model = input.model || "claude-opus-4-8";
	if (!apiKey) {
		return fail("anthropic: missing API key (set ANTHROPIC_API_KEY)");
	}

	const body = {
		model: model,
		max_tokens: 4096,
		messages: [{ role: "user", content: task }],
	};
	if (input.system) {
		body.system = String(input.system);
	}

	const res = host.fetch({
		url: "https://api.anthropic.com/v1/messages",
		method: "POST",
		headers: {
			"x-api-key": apiKey,
			"anthropic-version": "2023-06-01",
			"content-type": "application/json",
		},
		body: JSON.stringify(body),
	});

	if (!res || res.status < 200 || res.status >= 300) {
		return fail(
			"anthropic: HTTP " + (res ? res.status : "?") + ": " + (res ? res.body : ""),
		);
	}

	let data;
	try {
		data = JSON.parse(res.body || "{}");
	} catch (e) {
		return fail("anthropic: malformed response: " + res.body);
	}

	const text = (data.content || [])
		.filter(function (b) {
			return b.type === "text";
		})
		.map(function (b) {
			return b.text;
		})
		.join("");
	out(text || res.body);
	return 0;
}

module.exports = { delegate };
