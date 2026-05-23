import axios from 'axios';

const ADMIN_API_BASE = "https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin";
const SEED_KEY = "8813bc3a69";

async function main() {
    const email = process.argv[2] || `admin_${Date.now()}@realestacy.com`;
    const password = process.argv[3] || 'Password123!';
    const firstName = process.argv[4] || 'Admin';
    const lastName = process.argv[5] || 'User';

    console.log(`=== Seeding Admin ===`);
    console.log(`Email: ${email}`);
    console.log(`First Name: ${firstName}`);
    console.log(`Last Name: ${lastName}`);

    try {
        console.log(`Registering admin...`);
        const regRes = await axios.post(`${ADMIN_API_BASE}/admin/api/AdminAuth/create`, {
            seedKey: SEED_KEY,
            email,
            password,
            firstName,
            lastName
        });

        console.log('Registration Response:', JSON.stringify(regRes.data));
    } catch (err: any) {
        console.error('Registration failed/skipped:', err.response?.data || err.message);
    }

    try {
        console.log(`\nLogging in with new credentials...`);
        const loginRes = await axios.post(`${ADMIN_API_BASE}/admin/api/AdminAuth/login`, {
            email,
            password
        });

        if (loginRes.data?.token) {
            console.log('SUCCESS! Admin logged in successfully.');
            console.log('Admin Token:', loginRes.data.token);
        } else {
            console.error('FAILED: Login response did not contain token', loginRes.data);
            process.exit(1);
        }
    } catch (err: any) {
        console.error('FAILED: Login request failed', err.response?.data || err.message);
        process.exit(1);
    }
}

main();
