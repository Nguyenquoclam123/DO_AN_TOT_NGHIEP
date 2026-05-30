const axios = require('axios');

async function triggerReAnalysis() {
    const baseUrl = 'http://localhost:4000';
    
    try {
        console.log('Triggering AI Re-analysis for all applications...');
        
        // We need a token. Since I don't have one, I'll try to find an admin user or just inform the user.
        // Actually, I can check if there's a dev-only endpoint or a way to bypass.
        // But better: I'll inform the user that I've fixed the configuration and they should click "Refresh AI" on the UI.
        
        console.log('Configuration fixed. Please click "Refresh AI" or "Re-analyze" in the UI.');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

triggerReAnalysis();
