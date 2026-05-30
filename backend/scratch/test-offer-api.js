const axios = require('axios');

async function testOffer() {
    try {
        // Need to login first to get token
        const loginRes = await axios.post('http://localhost:4000/api/v1/auth/login', {
            email: 'admin@gmail.com', // Adjust as needed
            password: 'password'
        });
        const token = loginRes.data.access_token;

        // Try to create an offer for a known application ID
        // I'll get an application ID first
        const jobsRes = await axios.get('http://localhost:4000/api/v1/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const firstJob = jobsRes.data[0];
        const detailRes = await axios.get(`http://localhost:4000/api/v1/jobs/${firstJob.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const app = detailRes.data.applications[0];
        if (!app) {
            console.log('No applications found to test');
            return;
        }

        console.log(`Testing offer for application ${app.id}`);
        
        const offerRes = await axios.post('http://localhost:4000/api/v1/offers', {
            applicationId: app.id,
            salary: 15000000,
            startDate: '2026-05-15',
            notes: 'Test offer'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Offer created:', offerRes.data);
    } catch (err) {
        if (err.response) {
            console.error('Error status:', err.response.status);
            console.error('Error data:', err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}

testOffer();
