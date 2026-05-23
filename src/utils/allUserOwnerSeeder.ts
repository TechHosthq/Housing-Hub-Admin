import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev';

const propertyTypes = [0, 1, 2, 3, 4]; // House, Apartment, Guesthouse, Flat, Duplex
const availabilityStatuses = [0, 1, 2]; // Available, Occupied, Sold
const leaseTypes = [0, 1]; // Rent, Sale

const lagosLocations = [
    { place: 'Alirat street', city: 'Ikeja', state: 'Lagos' },
    { place: 'Lekki Phase 1', city: 'Lekki', state: 'Lagos' },
    { place: 'Victoria Island', city: 'Lagos Island', state: 'Lagos' },
    { place: 'Maryland Mall area', city: 'Ikeja', state: 'Lagos' },
    { place: 'Gbagada Phase 2', city: 'Gbagada', state: 'Lagos' },
];

async function getSampleImage() {
    // We'll use a small transparent pixel or a placeholder image
    // Since createProperty expects Files (blobs), we can fetch a real image and convert it
    const response = await axios.get('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=200', { responseType: 'arraybuffer' });
    return new Blob([response.data], { type: 'image/jpeg' });
}

export async function seedData() {
    const results = {
        owners: [] as any[],
        customers: [] as any[],
        properties: [] as any[],
        errors: [] as string[],
        logs: [] as string[],
    };

    const log = (msg: string) => {
        console.log(msg);
        results.logs.push(msg);
    };


    const imageBlob = await getSampleImage();

    // 1. Seed 3 Admins
    console.log('Seeding 3 admins...');
    const admins = [] as any[];
    const ADMIN_API_BASE = "https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin";

    for (let i = 1; i <= 3; i++) {
        const email = `admin${i}_${Math.floor(Math.random() * 10000)}@realestacy.com`;
        const password = 'Password123!';

        try {
            const regRes = await axios.post(`${ADMIN_API_BASE}/admin/api/AdminAuth/create`, {
                seedKey: "", // Trying empty string instead of null
                email,
                password,
                firstName: "Admin",
                lastName: `${i}`
            });


            log(`Admin ${i} creation response: ${JSON.stringify(regRes.data)}`);

            if (regRes.data.isSuccessful || regRes.data.data) {
                // Login as Admin
                const loginRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
                    emailOrPhone: email,
                    password,
                }).catch(err => {
                    log(`Admin ${i} login failed: ${err.message}`);
                    return null;
                });

                if (loginRes?.data?.isSuccessful) {
                    admins.push({ id: loginRes.data.data.id, email, token: loginRes.data.data.token });
                    log(`Admin ${i} logged in successfully.`);
                }
            }
        } catch (err: any) {
            log(`Error seeding admin ${i}: ${err.message} - ${JSON.stringify(err.response?.data || 'No response data')}`);
        }

    }

    const adminToken = admins[0]?.token;


    // 2. Seed 10 Owners
    console.log('Seeding 10 owners...');
    for (let i = 1; i <= 10; i++) {
        const email = `owner${i}_${Math.floor(Math.random() * 10000)}@realestacy.com`;
        const password = 'Password123!';

        try {
            // Register
            const regRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/register`, {
                firstName: `Owner`,
                lastName: `${i}`,
                email,
                phoneNumber: `080${Math.floor(10000000 + Math.random() * 90000000)}`,
                password,
                customerType: 2, // Homeowner
            });

            if (!regRes.data.isSuccessful) {
                log(`Registration failed for owner ${i} (possibly exists): ${regRes.data.message}`);
            } else {
                log(`Registration successful for owner ${i}: ${JSON.stringify(regRes.data)}`);
            }


            if (adminToken) {
                // Use Admin to verify Owner (Guessed admin verification endpoint)
                await axios.post(`${ADMIN_API_BASE}/admin/api/AdminUser/verify-email`, {
                    email: email
                }, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                }).catch(err => {
                    log(`Admin verification failed for ${email}: ${err.message}`);
                });

                // Also verify KYC
                await axios.put(`${API_BASE_URL}/api/v1/Customer/${regRes.data.data.id}/kyc/verify?approve=true`, {}, {
                    headers: { 'Authorization': `Bearer ${adminToken}` }
                }).catch(() => { });
            }









            // Login to get token
            const loginRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
                emailOrPhone: email,
                password,
            });

            console.log(`Login response for owner ${i}:`, loginRes.data);

            if (!loginRes.data.isSuccessful || !loginRes.data.data) {
                results.errors.push(`Failed to login owner ${i}: ${loginRes.data.message || 'No data returned'}`);
                continue;
            }

            const token = loginRes.data.data.token;
            const ownerId = loginRes.data.data.id;
            results.owners.push({ id: ownerId, email, token });




            // 2. Seed 10 Properties for each Owner
            console.log(`Seeding 10 properties for owner ${i}...`);
            for (let j = 1; j <= 10; j++) {
                const location = lagosLocations[Math.floor(Math.random() * lagosLocations.length)];
                const propertyTitle = `Luxury ${['House', 'Apartment', 'Duplex'][Math.floor(Math.random() * 3)]} ${i}-${j}`;

                const formData = new FormData();
                formData.append('Title', propertyTitle);
                formData.append('Description', `Beautifully maintained property in ${location.place}. Features modern amenities and great views.`);
                formData.append('PropertyType', '1'); // Apartment
                formData.append('Price', (Math.floor(Math.random() * 5000000) + 100000).toString());
                formData.append('Availability', '1');
                formData.append('PropertyLeaseType', '1');
                formData.append('Features', '0');
                formData.append('ContactPersonName', `Owner ${i}`);
                formData.append('ContactPersonEmail', email);
                formData.append('ContactPersonPhoneNumber', '08000000000');
                formData.append('OwnerId', ownerId);
                formData.append('PropertyAddress.Place', location.place);
                formData.append('PropertyAddress.City', location.city);
                formData.append('PropertyAddress.State', location.state);
                formData.append('PropertyAddress.Country', 'Nigeria');
                formData.append('PropertyAddress.PostalCode', '100001');
                formData.append('PropertyAddress.PropertyId', '');


                // Add File
                formData.append('Files', imageBlob, `property_${i}_${j}.jpg`);

                try {
                    const propRes = await axios.post(`${API_BASE_URL}/api/v1/Property`, formData, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    if (propRes.data.isSuccessful) {
                        const propertyId = propRes.data.data.id;
                        results.properties.push({ id: propertyId, title: propertyTitle });

                        // 3. Admin Verification (Publish)
                        console.log(`Publishing property ${propertyId}...`);
                        await axios.put(`https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin/admin/api/AdminProperty/${propertyId}/publish`)
                            .catch(err => {
                                console.error(`Failed to publish property ${propertyId}:`, err.response?.data || err.message);
                            });
                    } else {
                        results.errors.push(`Failed to create property ${j} for owner ${i}: ${propRes.data.message}`);
                    }
                } catch (err: any) {
                    results.errors.push(`Error creating property ${j} for owner ${i}: ${err.message}`);
                }
            }
        } catch (err: any) {
            results.errors.push(`Error seeding owner ${i}: ${err.message}`);
        }
    }

    // 4. Seed 20 UNVERIFIED Properties (requested by user)
    console.log('Seeding 20 unverified properties...');
    // We'll use the last successful owner if available, or just a new one
    if (results.owners.length > 0) {
        const lastOwner = results.owners[results.owners.length - 1];
        const token = lastOwner.token; // We need to store token in results.owners

        for (let k = 1; k <= 20; k++) {
            const location = lagosLocations[Math.floor(Math.random() * lagosLocations.length)];
            const propertyTitle = `Unverified Property ${k}`;

            const formData = new FormData();
            formData.append('Title', propertyTitle);
            formData.append('Description', `This property is not yet verified by admin.`);
            formData.append('PropertyType', '1');
            formData.append('Price', '1000000');
            formData.append('Availability', '1');
            formData.append('PropertyLeaseType', '1');
            formData.append('Features', '0');
            formData.append('ContactPersonName', `Owner`);
            formData.append('ContactPersonEmail', lastOwner.email);
            formData.append('ContactPersonPhoneNumber', '08000000000');
            formData.append('OwnerId', lastOwner.id);
            formData.append('PropertyAddress.Place', location.place);
            formData.append('PropertyAddress.City', location.city);
            formData.append('PropertyAddress.State', location.state);
            formData.append('PropertyAddress.Country', 'Nigeria');
            formData.append('PropertyAddress.PostalCode', '100001');
            formData.append('PropertyAddress.PropertyId', '');
            formData.append('Files', imageBlob, `unverified_${k}.jpg`);

            try {
                const propRes = await axios.post(`${API_BASE_URL}/api/v1/Property`, formData, {
                    headers: {
                        'Authorization': `Bearer ${lastOwner.token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (propRes.data.isSuccessful) {
                    results.properties.push({ id: propRes.data.data.id, title: propertyTitle, verified: false });
                    log(`Created unverified property ${k}`);
                }
            } catch (err: any) {
                log(`Error creating unverified property ${k}: ${err.message}`);
            }
        }
    }

    // 5. Seed 10 Customers
    console.log('Seeding 10 customers...');

    for (let i = 1; i <= 10; i++) {
        const email = `customer${i}_${Math.floor(Math.random() * 10000)}@realestacy.com`;
        const password = 'Password123!';


        try {
            const regRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/register`, {
                firstName: `Customer`,
                lastName: `${i}`,
                email,
                phoneNumber: `070${Math.floor(10000000 + Math.random() * 90000000)}`,
                password,
                customerType: 1, // Buyer/Renter
            });

            console.log(`Registration result for customer ${i}:`, regRes.data);

            if (regRes.data.isSuccessful) {
                if (adminToken) {
                    // Use Admin to verify Customer Email
                    await axios.post(`${ADMIN_API_BASE}/admin/api/AdminUser/verify-email`, {
                        email: email
                    }, {
                        headers: { 'Authorization': `Bearer ${adminToken}` }
                    }).catch(() => { });
                }

                results.customers.push({ id: regRes.data.data.id, email });
            } else {
                results.errors.push(`Failed to register customer ${i}: ${regRes.data.message}`);
            }



        } catch (err: any) {
            results.errors.push(`Error seeding customer ${i}: ${err.message}`);
        }
    }

    return results;
}

