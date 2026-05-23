import axios from 'axios';

const API_BASE_URL = 'https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev';
const ADMIN_API_BASE = 'https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin';

const owners = [
    { email: 'customer1_1778433063718@realestacy.com', password: 'Password123!' },
    { email: 'customer9_428@realestacy.com', password: 'Password123!' },
    { email: 'jeremyvictor788@gmail.com', password: 'Saladin123!@#' }
];

const testUsers = [
    { email: 'testuser@gmail.com', password: 'Password123!' },
    { email: 'testcustomer@gmail.com', password: 'Password123!' },
    { email: 'saladinjake@gmail.com', password: 'Password123!' }
];

const lagosLocations = [
    { place: 'Alirat street', city: 'Ikeja', state: 'Lagos' },
    { place: 'Lekki Phase 1', city: 'Lekki', state: 'Lagos' },
    { place: 'Victoria Island', city: 'Lagos Island', state: 'Lagos' },
    { place: 'Maryland Mall area', city: 'Ikeja', state: 'Lagos' },
    { place: 'Gbagada Phase 2', city: 'Gbagada', state: 'Lagos' },
];

const imageSets = [
    [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800',
        'https://images.unsplash.com/photo-1613490900233-141c5520d75a?q=80&w=800',
        'https://images.unsplash.com/photo-1613490341593-903780302396?q=80&w=800',
        'https://images.unsplash.com/photo-1613490341600-84080928f602?q=80&w=800',
        'https://images.unsplash.com/photo-1613490900139-347585090f70?q=80&w=800',
        'https://images.unsplash.com/photo-1613490493635-4f40f090b8f0?q=80&w=800',
    ],
    [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800',
        'https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=800',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800',
        'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?q=80&w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800',
    ],
    [
        'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800',
        'https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=800',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=800',
        'https://images.unsplash.com/photo-1600566752494-080c5780336a?q=80&w=800',
        'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=800',
    ],
    [
        'https://images.unsplash.com/photo-1602343168117-bb899738f3f0?q=80&w=800',
        'https://images.unsplash.com/photo-1600566752229-250766792694?q=80&w=800',
        'https://images.unsplash.com/photo-1600566752538-8a0322df6ed6?q=80&w=800',
        'https://images.unsplash.com/photo-1600566752638-669b3608670b?q=80&w=800',
        'https://images.unsplash.com/photo-1600566752654-3e9118c7d0d1?q=80&w=800',
        'https://images.unsplash.com/photo-1600566752464-e4080928f602?q=80&w=800',
    ]
];

async function getBlobsForSet(setIndex: number) {
    const set = imageSets[setIndex % imageSets.length];
    return await Promise.all(set.map(async (url) => {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
            return new Blob([response.data], { type: 'image/jpeg' });
        } catch (err) {
            console.warn(`Failed to fetch image ${url}, using fallback.`);
            const fallbackRes = await axios.get('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200', { responseType: 'arraybuffer' });
            return new Blob([fallbackRes.data], { type: 'image/jpeg' });
        }
    }));
}

async function runMassiveSeed() {
    console.log('--- Starting Massive Seeder with Images ---');

    try {
        // Pre-fetch all image sets to cache them
        console.log('Pre-fetching image sets...');
        const cachedBlobs = await Promise.all(imageSets.map((_, i) => getBlobsForSet(i)));
        console.log('Images cached.');

        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const adminLoginRes = await axios.post(`${ADMIN_API_BASE}/admin/api/AdminAuth/login`, {
            email: "ugoluwa@gmail.com",
            password: "Father+1"
        });
        const adminToken = adminLoginRes.data.token;
        console.log('Admin logged in.');

        const propertyIds: string[] = [];

        // 2. Process each Owner
        for (const owner of owners) {
            console.log(`\nProcessing Owner: ${owner.email}...`);
            let loginRes;
            try {
                loginRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
                    emailOrPhone: owner.email,
                    password: owner.password,
                });
            } catch (err) {
                console.log(`Login failed for ${owner.email}, attempting registration...`);
                const regRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/register`, {
                    firstName: owner.email.split('_')[0],
                    lastName: 'Owner',
                    email: owner.email,
                    phoneNumber: `080${Math.floor(10000000 + Math.random() * 90000000)}`,
                    password: owner.password,
                    customerType: 2, // Homeowner
                }).catch(e => e.response);

                if (regRes?.data?.isSuccessful || regRes?.status === 200) {
                    console.log(`Registration successful for ${owner.email}. Verifying...`);
                    await axios.post(`${ADMIN_API_BASE}/admin/api/AdminUser/verify-email`, {
                        email: owner.email
                    }, {
                        headers: { 'Authorization': `Bearer ${adminToken}` }
                    }).catch(() => {});
                    
                    loginRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
                        emailOrPhone: owner.email,
                        password: owner.password,
                    });
                }
            }

            if (!loginRes?.data?.isSuccessful) {
                console.error(`Could not settle owner ${owner.email}:`, loginRes?.data?.message);
                continue;
            }

            const token = loginRes.data.data.token;
            const ownerId = loginRes.data.data.id;
            const firstName = loginRes.data.data.firstName || 'Owner';

            const count = (owner.email === 'jeremyvictor788@gmail.com') ? 10 : 40;
            console.log(`Seeding ${count} properties for ${owner.email}...`);

            for (let i = 1; i <= count; i++) {
                const loc = lagosLocations[Math.floor(Math.random() * lagosLocations.length)];
                const setIdx = i % imageSets.length;
                const blobs = cachedBlobs[setIdx];
                const type = ['Apartment', 'Duplex', 'Penthouse', 'Villa'][i % 4];
                const title = `Premium ${type} by ${firstName} ${i}`;
                
                const formData = new FormData();
                formData.append('Title', title);
                formData.append('Description', `A high-end ${type.toLowerCase()} in ${loc.city}. Features premium finishes and modern architecture.`);
                formData.append('PropertyType', '1');
                formData.append('Price', (Math.floor(Math.random() * 15000000) + 5000000).toString());
                formData.append('Availability', '1');
                formData.append('PropertyLeaseType', '1');
                formData.append('Features', '0');
                formData.append('ContactPersonName', firstName);
                formData.append('ContactPersonEmail', owner.email);
                formData.append('ContactPersonPhoneNumber', '08000000000');
                formData.append('OwnerId', ownerId);
                formData.append('PropertyAddress.Place', loc.place);
                formData.append('PropertyAddress.City', loc.city);
                formData.append('PropertyAddress.State', loc.state);
                formData.append('PropertyAddress.Country', 'Nigeria');
                formData.append('PropertyAddress.PostalCode', '100001');

                // Append all 6 images
                blobs.forEach((blob, idx) => {
                    formData.append('Files', blob, `img_${idx}.jpg`);
                });

                try {
                    const propRes = await axios.post(`${API_BASE_URL}/api/v1/Property`, formData, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    if (propRes.data.isSuccessful) {
                        const propertyId = propRes.data.data.id;
                        propertyIds.push(propertyId);
                        
                        // Publish Property
                        await axios.put(`${ADMIN_API_BASE}/admin/api/AdminProperty/${propertyId}/publish`, {}, {
                            headers: { 'Authorization': `Bearer ${adminToken}` }
                        }).catch(() => {});
                        
                        if (i % 5 === 0) console.log(`Created and published ${i} properties...`);
                    } else {
                        console.error(`\nFailed to create property ${title}:`, propRes.data.message);
                    }
                } catch (err: any) {
                    console.error(`\nError creating property ${title}:`, err.response?.data || err.message);
                }
            }
        }

        console.log(`\nTotal properties created/ready: ${propertyIds.length}`);

        // 3. Seed Inspections
        console.log('\n--- Seeding Inspections ---');
        for (const user of testUsers) {
            console.log(`Logging in as test user: ${user.email}...`);
            const userLoginRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
                emailOrPhone: user.email,
                password: user.password,
            }).catch(() => null);

            if (!userLoginRes?.data?.isSuccessful) continue;

            const userToken = userLoginRes.data.data.token;
            const userId = userLoginRes.data.data.id;

            // Create 5 random inspections for this user
            for (let j = 0; j < 5; j++) {
                const propertyId = propertyIds[Math.floor(Math.random() * propertyIds.length)];
                if (!propertyId) continue;

                await axios.post(`${API_BASE_URL}/api/v1/Inspection`, {
                    propertyId,
                    scheduledDate: '2026-06-01',
                    scheduledTime: '12:00:00',
                    note: 'Interested in this property!',
                    authenticatedUserId: userId
                }, {
                    headers: { 'Authorization': `Bearer ${userToken}` }
                }).catch(() => null);
            }
            console.log(`Inspections seeded for ${user.email}.`);
        }

        console.log('\n--- Massive Seeding Completed ---');

    } catch (err: any) {
        console.error('Error:', err.response?.data || err.message);
    }
}

runMassiveSeed();
