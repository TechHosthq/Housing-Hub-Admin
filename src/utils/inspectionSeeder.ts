import axios from 'axios';

const API_BASE_URL = 'https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev';

const customers = [
    { email: 'customer9_4928@realestacy.com', password: 'Password123!', firstName: 'Customer9' },
    { email: 'ugoluwa@gmail.com', password: 'Father+1', firstName: 'Admin_Ugoluwa' }
];

const owner = { email: 'jeremyvictor788@gmail.com', password: 'Saladin123!@#' };

export async function seedInspections() {
    const results = {
        logs: [] as string[],
        errors: [] as string[],
    };
    const log = (msg: string) => {
        console.log(msg);
        results.logs.push(msg);
    };

    log('--- Starting Targeted Inspection Seeder for Jeremy Victor ---');

    try {
        // 1. Login as Jeremy (Owner) to get his properties
        log(`Logging in as Jeremy Victor: ${owner.email}...`);
        const ownerLoginRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
            emailOrPhone: owner.email,
            password: owner.password,
        });

        if (!ownerLoginRes.data.isSuccessful) {
            log(`Jeremy login failed: ${ownerLoginRes.data.message}`);
            return results;
        }

        const ownerToken = ownerLoginRes.data.data.token;
        const ownerId = ownerLoginRes.data.data.id;
        log('Jeremy logged in successfully.');

        // 2. Get Jeremy's properties
        log('Fetching properties for Jeremy...');
        const propRes = await axios.get(`${API_BASE_URL}/api/v1/Property/all?PageNumber=1&PageSize=200`);
        const allProperties = propRes.data.data.items;
        const jeremyProperties = allProperties.filter((p: any) => p.ownerId === ownerId || p.ownerName?.toLowerCase() === "jeremy victor");

        if (jeremyProperties.length === 0) {
            log('No properties found for Jeremy. Please seed properties first.');
            return results;
        }

        log(`Found ${jeremyProperties.length} properties for Jeremy Victor.`);

        // 3. Process each customer to create inspections on Jeremy's properties
        for (const customer of customers) {
            log(`\nProcessing Customer: ${customer.email}...`);

            // Login as Customer
            const customerLoginRes = await axios.post(`${API_BASE_URL}/api/v1/Auth/login`, {
                emailOrPhone: customer.email,
                password: customer.password,
            }).catch(() => null);

            if (!customerLoginRes?.data?.isSuccessful) {
                log(`Customer ${customer.email} login failed. Error: ${customerLoginRes?.data?.message || 'Unknown'}`);
                continue;
            }

            const customerToken = customerLoginRes.data.data.token;
            const customerId = customerLoginRes.data.data.id;
            log('Customer logged in successfully.');

            // Create inspections for ALL of Jeremy's properties using this customer
            const statuses = [
                { name: 'Pending', status: 0 },
                { name: 'Confirmed', status: 1 },
                { name: 'Completed', status: 3 },
                { name: 'Declined', status: 2 }, // 2 for Declined in some backends, user earlier said 4, I'll use logic from Respond endpoint
            ];

            for (let i = 0; i < jeremyProperties.length; i++) {
                const property = jeremyProperties[i];
                const statusInfo = statuses[i % statuses.length];

                log(`[${i+1}/${jeremyProperties.length}] Creating ${statusInfo.name} inspection for: ${property.title}...`);

                try {
                    // Create Inspection Request
                    const createRes = await axios.post(`${API_BASE_URL}/api/v1/Inspection`, {
                        propertyId: property.id,
                        scheduledDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        scheduledTime: '11:00:00',
                        note: `Automated ${statusInfo.name} seeding request from ${customer.firstName}.`,
                        authenticatedUserId: customerId
                    }, {
                        headers: { 'Authorization': `Bearer ${customerToken}` }
                    });

                    if (createRes.data.isSuccessful) {
                        const inspectionId = createRes.data.data.id;
                        
                        // Transition status if not pending
                        if (statusInfo.status !== 0) {
                            const accept = statusInfo.status === 1 || statusInfo.status === 3;
                            
                            await axios.put(`${API_BASE_URL}/api/v1/Inspection/${inspectionId}/respond`, {
                                inspectionId,
                                accept,
                                note: accept ? 'Inspection accepted by Jeremy.' : 'Property unavailable for inspection.'
                            }, {
                                headers: { 'Authorization': `Bearer ${ownerToken}` }
                            }).catch((err) => log(`  Transition Error: ${err.message}`));

                            // Mark as completed if status is 3
                            if (statusInfo.status === 3) {
                                await axios.put(`${API_BASE_URL}/api/v1/Inspection/${inspectionId}/status`, {
                                    status: 3
                                }, {
                                    headers: { 'Authorization': `Bearer ${ownerToken}` }
                                }).catch(() => {});
                            }
                        }
                        log(`  Successfully seeded ${statusInfo.name} inspection.`);
                    } else {
                        log(`  Failed: ${createRes.data.message}`);
                    }
                } catch (err: any) {
                    log(`  Error: ${err.message}`);
                }
            }
        }

        log('\n--- Targeted Inspection Seeding Completed ---');
        return results;

    } catch (err: any) {
        const errMsg = err.response?.data || err.message;
        log(`Fatal Error: ${JSON.stringify(errMsg)}`);
        results.errors.push(JSON.stringify(errMsg));
        return results;
    }
}
