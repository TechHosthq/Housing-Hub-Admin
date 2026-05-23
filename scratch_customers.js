const axios = require('axios');

const API = 'https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev';
const ADMIN = "https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin";
const SEED_KEY = '8813bc3a69';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
    // Login as admin
    console.log('Logging in as admin...');
    const loginRes = await axios.post(`${ADMIN}/api/AdminAuth/login`, {
        email: "ugoluwa@gmail.com",
        password: "Father+1"
    });
    const adminToken = loginRes.data?.token;
    if (!adminToken) { console.error("Admin login failed"); return; }
    console.log('Admin logged in ✓\n');

    // Verify the existing ct4 customer appears
    const listRes = await axios.get(`${ADMIN}/api/AdminCustomer`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log(`Current customers in DB: ${listRes.data?.data?.items?.length ?? 0} (totalCount: ${listRes.data?.data?.totalCount ?? 0})`);

    // Seed 15 customers with customerType: 4
    const NAMES = [
        ['Amara', 'Okafor'], ['Chidi', 'Eze'], ['Ngozi', 'Adeyemi'],
        ['Emeka', 'Nwosu'], ['Fatima', 'Bello'], ['Kemi', 'Adeleke'],
        ['Tunde', 'Bakare'], ['Sade', 'Oluwatobi'], ['Ibrahim', 'Musa'],
        ['Chioma', 'Obiora'], ['Femi', 'Abiodun'], ['Yetunde', 'Adebayo'],
        ['Olumide', 'Fashola'], ['Blessing', 'Okeke'], ['Damilola', 'Osei']
    ];

    let successCount = 0;
    for (let i = 0; i < NAMES.length; i++) {
        const [first, last] = NAMES[i];
        const email = `customer_${first.toLowerCase()}_${Date.now() + i}@realestacy.com`;
        const phone = `080${Math.floor(10000000 + Math.random() * 89999999)}`;

        try {
            const reg = await axios.post(`${API}/api/v1/Auth/register`, {
                firstName: first,
                lastName: last,
                email,
                phoneNumber: phone,
                password: 'Password123!',
                customerType: 4   // ← correct Customer type
            });

            if (reg.data?.isSuccessful) {
                successCount++;
                console.log(`  ✓ [${i+1}/15] ${first} ${last} (${email})`);

                // Try to verify email with seedKey (may or may not work)
                try {
                    await axios.post(`${API}/api/v1/Auth/verify-email`, {
                        email,
                        token: SEED_KEY
                    });
                    console.log(`    → Email verified ✓`);
                } catch {
                    console.log(`    → Email verify skipped (customer still visible to admin)`);
                }
            } else {
                console.log(`  ✗ [${i+1}/15] ${first} ${last}: ${reg.data?.message}`);
            }
        } catch (e) {
            console.log(`  ✗ [${i+1}/15] ${first} ${last}: ${e.response?.data?.message || e.message}`);
        }

        await sleep(300); // avoid rate limiting
    }

    await sleep(1000);

    // Final check
    const finalStats = await axios.get(`${ADMIN}/api/AdminDashboard/stats`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const finalList = await axios.get(`${ADMIN}/api/AdminCustomer`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });

    console.log(`\n===== SEEDING COMPLETE =====`);
    console.log(`Registered: ${successCount}/15`);
    console.log(`totalCustomers in DB: ${finalStats.data?.totalCustomers}`);
    console.log(`Items in /api/AdminCustomer: ${finalList.data?.data?.items?.length} (total: ${finalList.data?.data?.totalCount})`);
    
    if (finalList.data?.data?.items?.length > 0) {
        console.log('\nSample customers:');
        finalList.data.data.items.slice(0, 5).forEach(c => {
            console.log(`  - ${c.firstName} ${c.lastName} | isActive:${c.isActive} | isKycVerified:${c.isKycVerified} | kycPending:${c.kycPending}`);
        });
    }
}

run().catch(e => console.error("Fatal:", e.response?.data || e.message));
