// Example Extism wasm tool plugin.
//
// A plugin exports `tools` (the tool list) and `call_tool` (dispatch). Input is
// read with `Host.inputString()` and the result written with
// `Host.outputString(...)`. The host facade `host.log` / `host.fetch` is
// injected by the loader's prelude (see src/plugin_loader.rs PLUGIN_PRELUDE).
//
// Build to wasm with: extism-js plugin.js -i plugin.d.ts -o plugin.wasm
// (or let the CLI compile plugin.js on the fly when plugin.wasm is absent).

function tools() {
	Host.outputString(
		JSON.stringify([
			{
				name: "wordcount",
				description: "Count the words in the given text.",
				inputSchema: {
					type: "object",
					properties: {
						text: { type: "string", description: "Text to count words in" },
					},
					required: ["text"],
				},
			},
		]),
	);
}

function call_tool() {
	const input = JSON.parse(Host.inputString() || "{}");
	const args = input.arguments || {};
	if (input.name === "wordcount") {
		const text = String(args.text || "");
		const trimmed = text.trim();
		const count = trimmed ? trimmed.split(/\s+/).length : 0;
		host.log("info", "wordcount = " + count);
		Host.outputString(
			JSON.stringify({ content: [{ type: "text", text: String(count) }] }),
		);
		return 0;
	}
	Host.outputString(
		JSON.stringify({
			content: [{ type: "text", text: "unknown tool: " + input.name }],
			isError: true,
		}),
	);
	return 0;
}

module.exports = { tools, call_tool };
