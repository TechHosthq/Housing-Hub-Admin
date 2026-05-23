import axios from 'axios';

const API_BASE_URL = 'https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev';
const ADMIN_API_BASE = 'https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin';

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
    ]
];

async function getBlobsForSet(setIndex: number) {
    const set = imageSets[setIndex % imageSets.length];
    return await Promise.all(set.map(async (url) => {
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
            return new Blob([response.data], { type: 'image/jpeg' });
        } catch (err) {
            const fallbackRes = await axios.get('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=200', { responseType: 'arraybuffer' });
            return new Blob([fallbackRes.data], { type: 'image/jpeg' });
        }
    }));
}

export async function seedData() {
    const results = {
        owners: [] as any[],
        properties: [] as any[],
        inspections: [] as any[],
        errors: [] as string[],
        logs: [] as string[],
    };

    const log = (msg: string) => {
        console.log(msg);
        results.logs.push(msg);
    };

    try {
        log('--- Starting Massive API Seeding ---');

        // Pre-fetch image sets
        log('Pre-fetching image sets...');
        const cachedBlobs = await Promise.all(imageSets.map((_, i) => getBlobsForSet(i)));

        // 1. Login as Admin
        log('Logging in as Admin...');
        const adminLoginRes = await axios.post(`${ADMIN_API_BASE}/admin/api/AdminAuth/login`, {
            email: "ugoluwa@gmail.com",
            password: "Father+1"
        });
        const adminToken = adminLoginRes.data.token;

        const ownerConfigs = [
            { email: 'customer1_1778433063718@realestacy.com', password: 'Password123!', firstName: 'Customer1' },
            { email: 'customer9_428@realestacy.com', password: 'Password123!', firstName: 'Customer9' },
            { email: 'jeremyvictor788@gmail.com', password: 'Saladin123!@#', firstName: 'Jeremy' }
        ];

        const propertyIds: string[] = [];

        // 2. Process Owners and Properties
        for (const config of ownerConfigs) {
            log(`Processing Owner: ${config.email}...`);
            let token = '';
            let ownerId = '';

            try {
                const loginRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
                    emailOrPhone: config.email,
                    password: config.password,
                });
                token = loginRes.data.data.token;
                ownerId = loginRes.data.data.id;
            } catch (err) {
                log(`Registration fallback for ${config.email}...`);
                await axios.post(`${API_BASE_URL}/api/v1/Auth/register`, {
                    firstName: config.firstName,
                    lastName: 'Owner',
                    email: config.email,
                    phoneNumber: `080${Math.floor(10000000 + Math.random() * 90000000)}`,
                    password: config.password,
                    customerType: 2,
                }).catch(() => {});

                await axios.post(`${API_BASE_URL}/api/v1/Auth/verify-email`, { email: config.email, token: "8813bc3a69" }).catch(() => {});
                
                await axios.post(`${ADMIN_API_BASE}/admin/api/AdminUser/verify-email`, { email: config.email }, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                }).catch(() => {});

                const retryLogin = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
                    emailOrPhone: config.email,
                    password: config.password,
                });
                
                if (retryLogin.data?.isSuccessful && retryLogin.data?.data) {
                    token = retryLogin.data.data.token;
                    ownerId = retryLogin.data.data.id;
                } else {
                    log(`Failed to login after registration for ${config.email}: ${retryLogin.data?.message || 'Unknown error'}`);
                    continue;
                }
            }

            if (!token || !ownerId) continue;

            results.owners.push({ id: ownerId, email: config.email });
            const count = config.email === 'jeremyvictor788@gmail.com' ? 10 : 20; 

            for (let i = 1; i <= count; i++) {
                const loc = lagosLocations[Math.floor(Math.random() * lagosLocations.length)];
                const blobs = cachedBlobs[i % cachedBlobs.length];
                
                const formData = new FormData();
                formData.append('Title', `Elite ${['Villa', 'Suite', 'Penthouse'][i % 3]} ${config.firstName} ${i}`);
                formData.append('Description', `A premium property in ${loc.city}.`);
                formData.append('PropertyType', '1');
                formData.append('Price', '7500000');
                formData.append('Availability', '1');
                formData.append('PropertyLeaseType', '1');
                formData.append('Features', '0');
                formData.append('ContactPersonName', config.firstName);
                formData.append('ContactPersonEmail', config.email);
                formData.append('ContactPersonPhoneNumber', '08000000000');
                formData.append('OwnerId', ownerId);
                formData.append('PropertyAddress.Place', loc.place);
                formData.append('PropertyAddress.City', loc.city);
                formData.append('PropertyAddress.State', loc.state);
                formData.append('PropertyAddress.Country', 'Nigeria');
                formData.append('PropertyAddress.PostalCode', '100001');

                try {
                    const propRes = await axios.post(`${API_BASE_URL}/api/v1/Property`, formData, {
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                    });

                    if (propRes.data.isSuccessful) {
                        const pid = propRes.data.data.id;
                        propertyIds.push(pid);

                        const fileData = new FormData();
                        blobs.forEach((blob, idx) => { fileData.append('Files', blob, `img_${idx}.jpg`); });

                        await axios.post(`${API_BASE_URL}/api/v1/Property/${pid}/files`, fileData, {
                            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                        }).catch(() => {});

                        await axios.put(`${ADMIN_API_BASE}/admin/api/AdminProperty/${pid}/publish`, {}, {
                            headers: { 'Authorization': `Bearer ${adminToken}` }
                        }).catch(() => {});
                    }
                } catch (err: any) {
                    results.errors.push(`Prop Error: ${err.message}`);
                }
            }
        }

        // 3. Seed Inspections
        const testUsers = [
            { email: 'testuser@gmail.com', password: 'Password123!', firstName: 'TestUser' },
            { email: 'testcustomer@gmail.com', password: 'Password123!', firstName: 'TestCustomer' }
        ];

        for (const user of testUsers) {
            log(`Seeding inspections for ${user.email}...`);
            let uToken = '';
            let uId = '';

            try {
                const userLogin = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
                    emailOrPhone: user.email,
                    password: user.password,
                });
                uToken = userLogin.data.data.token;
                uId = userLogin.data.data.id;
            } catch (err) {
                log(`Registration for test user ${user.email}...`);
                await axios.post(`${API_BASE_URL}/api/v1/Auth/register`, {
                    firstName: user.firstName,
                    lastName: 'User',
                    email: user.email,
                    phoneNumber: `070${Math.floor(10000000 + Math.random() * 90000000)}`,
                    password: user.password,
                    customerType: 1,
                }).catch(() => {});

                await axios.post(`${API_BASE_URL}/api/v1/Auth/verify-email`, { email: user.email, token: "8813bc3a69" }).catch(() => {});
                
                const retryUserLogin = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
                    emailOrPhone: user.email,
                    password: user.password,
                }).catch(() => null);

                if (retryUserLogin?.data?.isSuccessful) {
                    uToken = retryUserLogin.data.data.token;
                    uId = retryUserLogin.data.data.id;

                    const statuses = [
                        { name: 'Pending', status: 0 },
                        { name: 'Confirmed', status: 1 },
                        { name: 'Completed', status: 3 },
                        { name: 'Declined', status: 2 },
                        { name: 'Cancelled', status: 4 },
                    ];

                    for (let j = 0; j < statuses.length; j++) {
                        const statusInfo = statuses[j];
                        const pid = propertyIds[j % propertyIds.length];
                        if (!pid) continue;

                        // 1. Create Inspection Request
                        const createRes = await axios.post(`${API_BASE_URL}/api/v1/Inspection`, {
                            propertyId: pid,
                            scheduledDate: '2026-06-15',
                            scheduledTime: '14:00:00',
                            note: `Seeded ${statusInfo.name} request.`,
                            authenticatedUserId: uId
                        }, {
                            headers: { 'Authorization': `Bearer ${uToken}` }
                        });

                        if (createRes.data.isSuccessful && statusInfo.status !== 0) {
                            const inspectionId = createRes.data.data.id;
                            
                            // 2. Respond to Inspection (as Owner/Admin)
                            const accept = statusInfo.status === 1 || statusInfo.status === 3;
                            await axios.put(`${API_BASE_URL}/api/v1/Inspection/${inspectionId}/respond`, {
                                inspectionId,
                                accept,
                                note: `Owner ${accept ? 'accepted' : 'declined'} this request.`
                            }, {
                                headers: { 'Authorization': `Bearer ${adminToken}` } // Using Admin token to simulate owner/system response
                            }).catch(() => {});

                            // 3. Mark as Completed if needed
                            if (statusInfo.status === 3) {
                                await axios.put(`${API_BASE_URL}/api/v1/Inspection/${inspectionId}/status`, {
                                    status: 3
                                }, {
                                    headers: { 'Authorization': `Bearer ${adminToken}` }
                                }).catch(() => {});
                            }
                        }
                    }
                }
            }
        }

        log('--- Seeding Completed Successfully ---');
        return results;

    } catch (err: any) {
        log(`Fatal Error: ${err.message}`);
        results.errors.push(err.message);
        return results;
    }
}
