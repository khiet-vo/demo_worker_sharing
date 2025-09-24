// main.js - Main thread JavaScript for handling UI and worker communication

document.addEventListener('DOMContentLoaded', function() {
    // Generate a unique ID for this tab
    const tabId = 'tab_' + Math.random().toString(36).substr(2, 9);
    document.getElementById('tabId').textContent = tabId;
    
    // DOM elements
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messageLog = document.getElementById('messageLog');
    
    // Initialize Web Worker
    let worker = null;
    if (window.Worker) {
        worker = new Worker('worker.js');
        
        // Handle messages from the worker
        worker.addEventListener('message', function(e) {
            const data = e.data;
            
            if (data.type === 'WORKER_READY') {
                console.log('Worker is ready!');
                // Initialize the worker with current localStorage
                worker.postMessage({
                    type: 'INIT'
                });
            }
            
            if (data.type === 'STORAGE_CHANGED') {
                // Handle storage change detected by worker
                if (data.key === 'message') {
                    const messageData = JSON.parse(data.newValue);
                    if (messageData.sender !== tabId) {  // Only process if from another tab
                        displayMessage(messageData.text, messageData.sender, 'received');
                    }
                }
            }
            
            if (data.type === 'REQUEST_STORAGE_VALUES') {
                // Worker is requesting the current localStorage values
                const storageValues = {};
                
                // Collect all localStorage items
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    storageValues[key] = localStorage.getItem(key);
                }
                
                // Send them back to the worker
                worker.postMessage({
                    type: 'STORAGE_VALUES',
                    storage: storageValues
                });
            }
        });
        
        // Handle errors from the worker
        worker.addEventListener('error', function(error) {
            console.error('Worker error:', error);
            addLog('Error with Web Worker: ' + error.message);
        });
    } else {
        // Web Workers are not supported
        console.error('Your browser does not support Web Workers');
        addLog('Error: Your browser does not support Web Workers');
    }
    
    // Listen for storage events directly on the main thread as a fallback
    // This won't fire in the same tab that changed the storage
    window.addEventListener('storage', function(e) {
        if (e.key === 'message') {
            const messageData = JSON.parse(e.newValue);
            if (messageData.sender !== tabId) {
                displayMessage(messageData.text, messageData.sender, 'received-direct');
            }
        }
    });
    
    // Handle send button click
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText) {
            // Create message object
            const messageData = {
                text: messageText,
                sender: tabId,
                timestamp: new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('message', JSON.stringify(messageData));
            
            // Display in our own UI
            displayMessage(messageText, tabId, 'sent');
            
            // Clear input field
            messageInput.value = '';
        }
    }
    
    function displayMessage(text, sender, type) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', type);
        
        let senderDisplay = sender;
        if (sender === tabId) {
            senderDisplay = 'You';
        } else {
            senderDisplay = 'Tab ' + sender.substring(4, 8); // Just show part of the ID
        }
        
        messageElement.innerHTML = `
            <span class="sender">${senderDisplay}:</span>
            <span class="text">${text}</span>
            <span class="time">${new Date().toLocaleTimeString()}</span>
        `;
        
        messageLog.appendChild(messageElement);
        messageLog.scrollTop = messageLog.scrollHeight;
    }
    
    function addLog(message) {
        const logElement = document.createElement('div');
        logElement.classList.add('log');
        logElement.textContent = message;
        messageLog.appendChild(logElement);
        messageLog.scrollTop = messageLog.scrollHeight;
    }
    
    // Add initial log
    addLog('Tab initialized with ID: ' + tabId);
    addLog('Open this page in another tab to start communicating');
});