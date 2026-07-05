// HTTP fetch MCP plugin: http_get / http_post over the host fetch bridge.
// Loopback/internal targets are blocked by the host (SSRF guard).

function tools() {
	Host.outputString(
		JSON.stringify([
			{
				name: "http_get",
				description: "HTTP GET a URL and return the response body.",
				inputSchema: {
					type: "object",
					properties: { url: { type: "string", description: "URL to GET" } },
					required: ["url"],
				},
			},
			{
				name: "http_post",
				description: "HTTP POST a body to a URL and return the response body.",
				inputSchema: {
					type: "object",
					properties: {
						url: { type: "string", description: "URL to POST to" },
						body: { type: "string", description: "Request body" },
						contentType: {
							type: "string",
							description: "Content-Type header (default application/json)",
						},
					},
					required: ["url", "body"],
				},
			},
		]),
	);
}

function respond(res) {
	if (!res) {
		Host.outputString(
			JSON.stringify({
				content: [{ type: "text", text: "fetch: no response" }],
				isError: true,
			}),
		);
		return 0;
	}
	Host.outputString(
		JSON.stringify({
			content: [{ type: "text", text: "HTTP " + res.status + "\n" + res.body }],
		}),
	);
	return 0;
}

function call_tool() {
	const input = JSON.parse(Host.inputString() || "{}");
	const args = input.arguments || {};
	if (input.name === "http_get") {
		return respond(host.fetch({ url: String(args.url || ""), method: "GET" }));
	}
	if (input.name === "http_post") {
		return respond(
			host.fetch({
				url: String(args.url || ""),
				method: "POST",
				headers: { "content-type": String(args.contentType || "application/json") },
				body: String(args.body || ""),
			}),
		);
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
