// Export + host-import surface for a `provider` wasm plugin. Used by `extism-js`
// when building plugin.wasm; mirrors the loader's PLUGIN_DTS_PROVIDER.
declare module "main" {
	export function delegate(): I32;
}
declare module "extism:host" {
	interface user {
		host_log(ptr: I64): I64;
		host_fetch(ptr: I64): I64;
	}
}
