// worker.js - Web Worker to listen for storage events

// Set up a listener for the 'storage' event
// However, since Web Workers don't have direct access to localStorage events,
// We need to use a different approach - we'll poll for changes

let previousData = {};

// Function to check localStorage and detect changes
function checkStorageChanges() {
  try {
    // Send a message to the main thread to request the current localStorage values
    self.postMessage({
      type: 'REQUEST_STORAGE_VALUES'
    });
  } catch (error) {
    console.error('Error in worker when checking storage:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', function(e) {
  const data = e.data;
  
  if (data.type === 'STORAGE_VALUES') {
    // We received localStorage values from the main thread
    const currentData = data.storage;
    
    // Compare with previous values to detect changes
    for (const key in currentData) {
      // If the key is new or changed
      if (!previousData[key] || previousData[key] !== currentData[key]) {
        // Send message about change to main thread
        self.postMessage({
          type: 'STORAGE_CHANGED',
          key: key,
          oldValue: previousData[key] || null,
          newValue: currentData[key]
        });
      }
    }
    
    // Update our previous data copy
    previousData = { ...currentData };
  }
  
  // Handle initialization
  if (data.type === 'INIT') {
    // Start the polling process
    setInterval(checkStorageChanges, 1000); // Check every second
    
    // Initial check
    checkStorageChanges();
  }
});

// Send a message that we're ready
self.postMessage({
  type: 'WORKER_READY'
});