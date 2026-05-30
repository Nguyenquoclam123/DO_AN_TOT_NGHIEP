const axios = require('axios');

async function checkCompany() {
  try {
    // Assuming HBLAB is one of the companies, we can list all and check
    const response = await axios.get('http://localhost:4000/api/v1/companies');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching companies:', error.message);
  }
}

checkCompany();
