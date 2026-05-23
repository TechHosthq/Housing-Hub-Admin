const axios = require('axios');

async function checkRandomProperty() {
    const API_BASE_URL = 'https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev';

    try {
        console.log('Fetching all properties...');
        const res = await axios.get(`${API_BASE_URL}/api/v1/Property/all?PageNumber=1&PageSize=10`);
        const properties = res.data.data.items;
        
        if (properties.length === 0) {
            console.log('No properties found!');
            return;
        }

        for (const prop of properties) {
            console.log(`\nChecking Property: ${prop.title} (${prop.id})`);
            console.log(`addressId from property detail: ${prop.addressId}`);
            
            try {
                const addrRes = await axios.get(`${API_BASE_URL}/api/v1/PropertyAddress/property/${prop.id}`);
                console.log('Fetch by propertyId SUCCESS:', addrRes.data.isSuccessful);
            } catch (err) {
                console.log('Fetch by propertyId FAILED:', err.response?.data?.message || err.message);
            }

            if (prop.addressId && prop.addressId !== '00000000-0000-0000-0000-000000000000') {
                try {
                    const addrRes = await axios.get(`${API_BASE_URL}/api/v1/PropertyAddress/${prop.addressId}`);
                    console.log('Fetch by addressId SUCCESS:', addrRes.data.isSuccessful);
                } catch (err) {
                    console.log('Fetch by addressId FAILED:', err.response?.data?.message || err.message);
                }
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkRandomProperty();
