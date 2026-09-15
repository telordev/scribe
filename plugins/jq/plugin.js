// JSON query MCP plugin: extract a value from a JSON document by dot path.
// Path segments index objects and arrays (e.g. "items.0.name"); an empty path
// returns the whole document.
//
// The dispatch is pure JS: this plugin calls neither `host.log` nor
// `host.fetch`, so it opens no socket and writes nothing to the host log. The
// sibling plugin.d.ts still DECLARES both host imports, deliberately — it is
// the same surface the loader's built-in PLUGIN_DTS declares when it compiles a
// plugin.js on the fly (src/plugin_loader.rs), and keeping the two identical is
// what makes the prebuilt plugin.wasm and the on-the-fly build the same module.

function tools() {
	Host.outputString(
		JSON.stringify([
			{
				name: "json_query",
				description:
					"Extract a value from a JSON document by dot path (e.g. 'items.0.name'). Empty path returns the whole document.",
				inputSchema: {
					type: "object",
					properties: {
						json: { type: "string", description: "JSON text to query" },
						path: {
							type: "string",
							description: "Dot path into the document (optional)",
						},
					},
					required: ["json"],
				},
			},
		]),
	);
}

function out(obj) {
	Host.outputString(JSON.stringify(obj));
}

function call_tool() {
	const input = JSON.parse(Host.inputString() || "{}");
	const args = input.arguments || {};
	if (input.name !== "json_query") {
		out({
			content: [{ type: "text", text: "unknown tool: " + input.name }],
			isError: true,
		});
		return 0;
	}

	let doc;
	try {
		doc = JSON.parse(String(args.json || ""));
	} catch (e) {
		out({
			content: [{ type: "text", text: "json_query: invalid JSON: " + e }],
			isError: true,
		});
		return 0;
	}

	const path = String(args.path || "").trim();
	let cur = doc;
	if (path) {
		const parts = path.split(".");
		for (let i = 0; i < parts.length; i++) {
			if (cur == null) {
				cur = undefined;
				break;
			}
			cur = cur[parts[i]];
		}
	}

	const text =
		cur === undefined
			? "null"
			: typeof cur === "string"
				? cur
				: JSON.stringify(cur);
	out({ content: [{ type: "text", text: text }] });
	return 0;
}

module.exports = { tools, call_tool };
