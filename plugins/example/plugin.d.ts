// Extism export + host-import surface for an MCP wasm plugin. Used by
// `extism-js` when building plugin.wasm; mirrors the loader's built-in PLUGIN_DTS.
declare module "main" {
	export function tools(): I32;
	export function call_tool(): I32;
}
declare module "extism:host" {
	interface user {
		host_log(ptr: I64): I64;
		host_fetch(ptr: I64): I64;
	}
}
