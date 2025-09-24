# LocalStorage & Web Worker Demo

A demonstration of cross-tab communication using LocalStorage and Web Workers.

## Overview

This demo shows how two browser tabs from the same domain can communicate with each other:

1. Tab A makes changes to LocalStorage
2. Tab B listens for these changes using a Web Worker
3. The Worker sends messages to Tab B's main thread
4. Tab B displays the changes

## Features

- Real-time communication between browser tabs
- Background processing using Web Workers
- Persistent data using LocalStorage
- Unique identification for each tab
- Clean and responsive UI

## How to Test

1. Open the demo URL in two different browser tabs
2. Enter a message in the first tab and click "Send"
3. Watch the message appear in the second tab
4. Try sending a reply from the second tab

## Technical Implementation

- **HTML/CSS/JavaScript**: Core web technologies
- **LocalStorage API**: For cross-tab data persistence
- **Web Workers API**: For background processing
- **Storage Events**: For change detection

## Development

To run this demo locally:

```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx http-server
```

Then open http://localhost:8000 (or the appropriate port) in multiple browser tabs.

## License

MIT