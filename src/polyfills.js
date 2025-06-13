// Polyfill for MessageChannel in Cloudflare Workers environment
if (typeof MessageChannel === 'undefined') {
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = {};
      this.port2 = {};
    }
  };
}

export {}; 