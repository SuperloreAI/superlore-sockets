# Superlore Sockets

This is a websockets server for Superlore frontend.
It is a seperate server because NextJS does not natively support websocket connections due to the fact that it is a server side rendered framework with emphasis on edge caching. Websockets are not easily compatible with edge caching.

## Getting Started

```bash
$ npm install
$ npm run dev
```

## Deployment

```bash
$ npm run deploy
```

## Routes

- `/api/sockets`
- `/api/sockets/health`
- `/extractor/tiktok/video`
- `/extractor/youtube/video`
- `/extractor/youtube/audio`
- `/clipper/video`
- `/clipper/audio`


## TODO

☑️ Use websockets to notify when an asset has finished processing
☑️ Extract user ID from the auth headers of the request
☑️ Use the user ID to create a folder for the user on cloud storage
☑️ Save the assets into the database