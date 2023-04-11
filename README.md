# Superlore Sockets

This is a websockets server for Superlore frontend.
It is a seperate server because NextJS does not natively support websocket connections due to the fact that it is a server side rendered framework with emphasis on edge caching. Websockets are not easily compatible with edge caching.

## Getting Started

```bash
$ npm install
$ npm run dev
```