const axios = require('axios');

async function testAddress() {
    const API_BASE_URL = 'https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev';
    const propertyId = '043900d8-d92d-4cf0-9e84-60a0e5cf4ddc';
    const addressId = '726b996b-bb84-45a5-8a20-76d88bfc481f';

    console.log('Testing fetch by propertyId...');
    try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/PropertyAddress/property/${propertyId}`);
        console.log('By propertyId SUCCESS:', res.data);
    } catch (err) {
        console.log('By propertyId FAILED:', err.response?.status, err.response?.data?.message || err.message);
    }

    console.log('\nTesting fetch by addressId...');
    try {
        const res = await axios.get(`${API_BASE_URL}/api/v1/PropertyAddress/${addressId}`);
        console.log('By addressId SUCCESS:', res.data);
    } catch (err) {
        console.log('By addressId FAILED:', err.response?.status, err.response?.data?.message || err.message);
    }
}

testAddress();
