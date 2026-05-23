const axios = require('axios');

async function test() {
    console.log("Logging in as Admin...");
    let adminToken;
    try {
        const loginRes = await axios.post("https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin/admin/api/AdminAuth/login", {
            email: "ugoluwa@gmail.com",
            password: "Father+1"
        });
        adminToken = loginRes.data.token;
        console.log("Admin logged in. Token acquired.");
    } catch (err) {
        console.error("Admin login failed", err.message);
        return;
    }

    const email = "testseedkey1@realestacy.com";
    const seedKey = "8813bc3a69";

    const payloads = [
        { email, token: seedKey },
        { email, token: adminToken, seedKey },
        { email, token: "dummy", seedKey },
        { email, seedKey },
        { email, token: seedKey, seedKey: adminToken }
    ];

    for (let i = 0; i < payloads.length; i++) {
        console.log(`\nTesting payload ${i + 1}:`, Object.keys(payloads[i]));
        try {
            const res = await axios.post('https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev/api/v1/Auth/verify-email', payloads[i], {
                timeout: 10000
            });
            if (res.data.isSuccessful) {
                console.log('SUCCESS! Email verified:', res.data);
                return;
            } else {
                console.log('FAILED (API response):', res.data.message);
            }
        } catch (err) {
            console.log('FAILED (Exception):', err.response?.data || err.message);
        }
    }
}

test();

