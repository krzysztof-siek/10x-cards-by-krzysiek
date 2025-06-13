// Polyfill for MessageChannel in Cloudflare Workers environment
if (typeof MessageChannel === "undefined") {
  // Implementacja zastępcza dla MessageChannel
  globalThis.MessageChannel = function MessageChannel() {
    this.port1 = {};
    this.port2 = {};
  };
}

export {};
