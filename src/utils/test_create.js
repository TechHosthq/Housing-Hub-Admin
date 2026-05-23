const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testCreate() {
    const API_BASE_URL = 'https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev';
    const email = 'jeremyvictor788@gmail.com';
    const password = 'Saladin123!@#';

    try {
        const loginRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
            emailOrPhone: email,
            password,
        });

        const token = loginRes.data.data.token;
        const ownerId = loginRes.data.data.id;

        const formData = new FormData();
        formData.append('Title', 'Test Property');
        formData.append('Description', 'Test Description');
        formData.append('PropertyType', '1');
        formData.append('Price', '1000000');
        formData.append('Availability', '1');
        formData.append('PropertyLeaseType', '1');
        formData.append('Features', '0');
        formData.append('ContactPersonName', 'Jeremy Victor');
        formData.append('ContactPersonEmail', email);
        formData.append('ContactPersonPhoneNumber', '08000000000');
        formData.append('OwnerId', ownerId);
        formData.append('PropertyAddress.Place', 'Test Place');
        formData.append('PropertyAddress.City', 'Test City');
        formData.append('PropertyAddress.State', 'Lagos');
        formData.append('PropertyAddress.Country', 'Nigeria');
        formData.append('PropertyAddress.PostalCode', '100001');
        // formData.append('PropertyAddress.PropertyId', '00000000-0000-0000-0000-000000000000');

        // Minimal dummy "file"
        // formData.append('Files', fs.createReadStream('src/utils/test_image.jpg'));

        const res = await axios.post(`${API_BASE_URL}/api/v1/Property`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('Property Created:', res.data.data.id);
        const propId = res.data.data.id;

        // Step 2: Upload File
        const fileData = new FormData();
        fileData.append('Files', fs.createReadStream('src/utils/test_image.jpg'));

        const fileRes = await axios.post(`${API_BASE_URL}/api/v1/Property/${propId}/files`, fileData, {
            headers: {
                ...fileData.getHeaders(),
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('File Uploaded:', fileRes.data);
    } catch (err) {
        console.log('Error Status:', err.response?.status);
        console.log('Error Data:', JSON.stringify(err.response?.data, null, 2));
    }
}

testCreate();
