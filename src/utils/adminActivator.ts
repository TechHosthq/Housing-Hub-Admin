import axios from 'axios';

const ADMIN_API_BASE = "https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin";
const AUTH_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev';

export async function adminActivate() {
    const results = {
        logs: [] as string[],
        publishedProperties: 0,
        errors: [] as string[],
    };

    const log = (msg: string) => {
        console.log(msg);
        results.logs.push(msg);
    };

    try {
        log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${ADMIN_API_BASE}/admin/api/AdminAuth/login`, {
            email: "ugoluwa@gmail.com",
            password: "Father+1"
        });

        const token = loginRes.data?.token;
        if (!token) {
            throw new Error("Failed to retrieve admin token");
        }
        log('Admin logged in successfully.');

        log('2. Fetching existing properties...');
        const propertiesRes = await axios.get(`${ADMIN_API_BASE}/admin/api/AdminProperty?PageNumber=1&PageSize=200`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const properties = propertiesRes.data?.data?.items || propertiesRes.data?.data || propertiesRes.data || [];
        const propertyList = Array.isArray(properties) ? properties : properties.data || [];
        
        log(`Found ${propertyList.length} properties in fetch response.`);
        if (propertyList.length === 0) {
            log(`Properties structure: ${JSON.stringify(propertiesRes.data).substring(0, 500)}`);
        }
        
        log('3. Publishing all properties...');
        let publishedCount = 0;

        for (const property of propertyList) {
            const propId = property.id;
            if (!propId) continue;

            try {
                log(`Publishing property ${propId}...`);
                await axios.put(`${ADMIN_API_BASE}/admin/api/AdminProperty/${propId}/publish`, {
                    seedKey: "8813bc3a69"
                }, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                publishedCount++;
                log(`Successfully published ${propId}`);
            } catch (err: any) {
                const errorMsg = err.response?.data?.message || err.message;
                log(`Failed to publish ${propId}: ${errorMsg}`);
                if (err.response?.status !== 400 && err.response?.status !== 409) {
                     results.errors.push(`Error publishing ${propId}: ${errorMsg}`);
                }
            }
        }

        results.publishedProperties = publishedCount;
        log(`Activation process finished. Published ${publishedCount} properties.`);



    } catch (err: any) {
        log(`Critical Error in admin activator: ${err.message}`);
        results.errors.push(err.message);
    }

    return results;
}
