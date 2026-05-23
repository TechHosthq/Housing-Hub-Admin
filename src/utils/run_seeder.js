/**
 * admin-frontend/src/utils/run_seeder.js
 *
 * Run from the admin-frontend directory:
 *   node src/utils/run_seeder.js
 *
 * Fixes applied:
 *   1. PropertyType:         1-15 (0 is INVALID per swagger)
 *   2. PropertyLeaseType:    1-3  (0 is INVALID per swagger)
 *   3. PropertyAvailability: 1-5  (0 is INVALID per swagger)
 *   4. Files: Buffer.alloc(1000) — avoids Mapster 500 from corrupt JPEG
 *   5. Admin login via Admin API (not client API)
 *   6. Publish URL correct + seedKey body + auth header
 *   7. PropertyAddress.PropertyId: zero-GUID
 */

const axios = require('axios');
const FormData = require('form-data');
const fs   = require('fs');
const path = require('path');

const API   = 'https://pk1wr06fr1.execute-api.af-south-1.amazonaws.com/dev';
const ADMIN = 'https://3tgjb2crdf.execute-api.af-south-1.amazonaws.com/admin';
const SEED_KEY = '8813bc3a69';

const LOCATIONS = [
    { place: 'Alirat Street',       city: 'Ikeja',        state: 'Lagos' },
    { place: 'Lekki Phase 1',       city: 'Lekki',        state: 'Lagos' },
    { place: 'Victoria Island',     city: 'Lagos Island',  state: 'Lagos' },
    { place: 'Maryland Mall Area',  city: 'Ikeja',        state: 'Lagos' },
    { place: 'Gbagada Phase 2',     city: 'Gbagada',      state: 'Lagos' },
    { place: 'Surulere',            city: 'Surulere',     state: 'Lagos' },
    { place: 'Yaba Tech Area',      city: 'Yaba',         state: 'Lagos' },
];
const LABELS = ['Villa', 'Penthouse', 'Duplex', 'Bungalow', 'Apartment', 'Suite', 'Mansion'];

// 1 KB of zeros — safe fake image that avoids Mapster 500
const FAKE_IMAGE = Buffer.alloc(1000);

const results = { admins:[], owners:[], customers:[], properties:[], errors:[], logs:[] };
const log = m => { console.log(`[${new Date().toISOString().slice(11,19)}] ${m}`); results.logs.push(m); };
const err = m => { console.error(`[ERR] ${m}`); results.errors.push(m); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const detail = e => JSON.stringify(e?.response?.data ?? e?.message ?? String(e));

// ── Phase 1: Admin login ──────────────────────────────────────────────────────
async function loginAdmin() {
    log('PHASE 1 — Admin login...');
    try {
        const r = await axios.post(`${ADMIN}/admin/api/AdminAuth/login`,
            { email: 'ugoluwa@gmail.com', password: 'Father+1' });
        const token = r.data?.token;
        if (!token) throw new Error('No token: ' + JSON.stringify(r.data));
        log('Admin logged in ✓ (ugoluwa@gmail.com)');
        results.admins.push({ email: 'ugoluwa@gmail.com', token });
        return token;
    } catch (e) {
        err(`Admin login failed: ${detail(e)} — creating new admin...`);
        return createNewAdmin();
    }
}

async function createNewAdmin() {
    const email = `admin_seed_${Date.now()}@realestacy.com`;
    const pwd   = 'Password123!';
    try {
        await axios.post(`${ADMIN}/admin/api/AdminAuth/create`,
            { seedKey: SEED_KEY, email, password: pwd, firstName: 'SeedAdmin', lastName: 'Bot' });
        const r = await axios.post(`${ADMIN}/admin/api/AdminAuth/login`, { email, password: pwd });
        const token = r.data?.token;
        if (!token) throw new Error('No token after create');
        log('New admin created & logged in ✓');
        results.admins.push({ email, token });
        return token;
    } catch (e) { err(`Admin creation failed: ${detail(e)}`); return null; }
}

// ── Phase 2: Probe verify-email ───────────────────────────────────────────────
let VERIFY_STRATEGY = null;

async function probeVerifyEmail(adminToken) {
    log('PHASE 2 — Probing email-verification endpoints...');
    const probeEmail = `probe_${Date.now()}@realestacy.com`;
    try {
        const r = await axios.post(`${API}/api/v1/Auth/register`, {
            firstName:'Probe', lastName:'Bot', email: probeEmail,
            phoneNumber:`080${Math.floor(10000000+Math.random()*90000000)}`,
            password:'Password123!', customerType:1,
        });
        if (!r.data.isSuccessful) { err(`Probe reg failed: ${r.data.message}`); return; }
        log(`Probe account created: ${probeEmail}`);
    } catch(e) { err(`Probe reg exception: ${detail(e)}`); return; }

    const candidates = [
        { label:'AdminUser/verify-email (with /admin/)', method:'post',
          url:`${ADMIN}/admin/api/AdminUser/verify-email`, body:{ email: probeEmail },
          headers:{ Authorization:`Bearer ${adminToken}` } },
        { label:'AdminUser/verify-email (no /admin/)', method:'post',
          url:`${ADMIN}/api/AdminUser/verify-email`, body:{ email: probeEmail },
          headers:{ Authorization:`Bearer ${adminToken}` } },
        { label:'AdminAuth/verify-email (with /admin/)', method:'post',
          url:`${ADMIN}/admin/api/AdminAuth/verify-email`, body:{ email: probeEmail },
          headers:{ Authorization:`Bearer ${adminToken}` } },
        { label:'Client verify {token:seedKey}', method:'post',
          url:`${API}/api/v1/Auth/verify-email`, body:{ email: probeEmail, token: SEED_KEY },
          headers:{} },
        { label:'Client verify {token:seedKey, seedKey}', method:'post',
          url:`${API}/api/v1/Auth/verify-email`, body:{ email: probeEmail, token: SEED_KEY, seedKey: SEED_KEY },
          headers:{} },
    ];

    for (const c of candidates) {
        try {
            const r = c.method==='put'
                ? await axios.put(c.url, c.body, { headers:c.headers })
                : await axios.post(c.url, c.body, { headers:c.headers });
            const ok = r.data?.isSuccessful !== false && r.status < 300;
            if (ok) { log(`✅ Verify strategy: ${c.label}`); VERIFY_STRATEGY = c; return; }
            else log(`  ✗ ${c.label} → ${r.data?.message || r.status}`);
        } catch(e) {
            log(`  ✗ ${c.label} → ${e?.response?.status} ${e?.response?.data?.message ?? e?.message}`);
        }
        await sleep(300);
    }
    err('No verify-email strategy found — only pre-verified accounts will be used.');
}

async function verifyEmail(email, adminToken) {
    if (!VERIFY_STRATEGY) return;
    try {
        const body    = { ...VERIFY_STRATEGY.body, email };
        const headers = VERIFY_STRATEGY.headers;
        VERIFY_STRATEGY.method === 'put'
            ? await axios.put(VERIFY_STRATEGY.url, body, { headers })
            : await axios.post(VERIFY_STRATEGY.url, body, { headers });
        log(`  Email verified: ${email}`);
    } catch(e) { log(`  Verify warning for ${email}: ${detail(e)}`); }
}

// ── Phase 3: Existing verified owners ────────────────────────────────────────
const EXISTING_OWNERS = [
    { email:'jeremyvictor788@gmail.com',              password:'Saladin123!@#', name:'Jeremy' },
    { email:'customer1_1778433063718@realestacy.com', password:'Password123!', name:'Customer1' },
    { email:'customer9_428@realestacy.com',           password:'Password123!', name:'Customer9' },
];

async function loginExistingOwners() {
    log('PHASE 3 — Existing owner accounts...');
    const owners = [];
    for (const cfg of EXISTING_OWNERS) {
        try {
            const r = await axios.post(`${API}/api/v1/Auth/login`,
                { emailOrPhone: cfg.email, password: cfg.password });
            if (!r.data?.isSuccessful || !r.data?.data) { log(`  ✗ ${cfg.email} — ${r.data?.message}`); continue; }
            const { token, id } = r.data.data;
            log(`  ✓ ${cfg.email} (id: ${id})`);
            owners.push({ id, email: cfg.email, token, name: cfg.name });
        } catch(e) { log(`  ✗ ${cfg.email} — ${detail(e)}`); }
    }
    return owners;
}

// ── Phase 4: New owners ───────────────────────────────────────────────────────
async function registerAndLoginOwner(index, adminToken) {
    const email = `owner_seed_${index}_${Date.now()}@realestacy.com`;
    const pwd   = 'Password123!';
    try {
        const rr = await axios.post(`${API}/api/v1/Auth/register`, {
            firstName:'Owner', lastName:`${index}`, email,
            phoneNumber:`080${Math.floor(10000000+Math.random()*90000000)}`,
            password: pwd, customerType:2,
        });
        if (!rr.data.isSuccessful) { err(`Owner ${index} reg failed: ${rr.data.message}`); return null; }
        log(`  Owner ${index} registered: ${email}`);
    } catch(e) { err(`Owner ${index} reg exception: ${detail(e)}`); return null; }

    await verifyEmail(email, adminToken);
    await sleep(500);

    try {
        const lr = await axios.post(`${API}/api/v1/Auth/login`, { emailOrPhone: email, password: pwd });
        if (!lr.data?.isSuccessful || !lr.data?.data) { err(`  Owner ${index} login failed: ${lr.data?.message}`); return null; }
        const { token, id } = lr.data.data;
        log(`  Owner ${index} logged in ✓ (id: ${id})`);
        return { id, email, token, name:`Owner${index}` };
    } catch(e) { err(`  Owner ${index} login exception: ${detail(e)}`); return null; }
}

// ── Phase 5: Create + publish property ───────────────────────────────────────
// Swagger-correct enum values:
//   PropertyType:         1–15
//   PropertyLeaseType:    1–3
//   PropertyAvailability: 1–5
//   PropertyFeature:      [0,1,2,4,8,16,…] (flags enum, 0=None is valid)
async function createProperty(owner, idx, adminToken) {
    const loc   = LOCATIONS[idx % LOCATIONS.length];
    const label = LABELS[idx % LABELS.length];
    const title = `${label} ${idx} — ${loc.city}`;

    const propertyType = (idx % 15) + 1;           // 1–15
    const leaseType    = (idx % 3)  + 1;           // 1–3
    const availability = (idx % 5)  + 1;           // 1–5
    const features     = [1,2,4,8,16][idx % 5];   // valid flag values
    const price        = String(Math.floor(Math.random() * 12_000_000) + 800_000);

    const form = new FormData();
    form.append('Title',       title);
    form.append('Description', `A stunning ${label.toLowerCase()} in ${loc.place}, ${loc.city}. Premium finishes, modern amenities.`);
    form.append('PropertyType',         String(propertyType));
    form.append('Price',                price);
    form.append('Availability',         String(availability));
    form.append('PropertyLeaseType',    String(leaseType));
    form.append('Features',             String(features));
    form.append('ContactPersonName',    owner.name ?? 'Owner');
    form.append('ContactPersonEmail',   owner.email);
    form.append('ContactPersonPhoneNumber', '08012345678');
    form.append('OwnerId',              owner.id);
    form.append('PropertyAddress.Place',      loc.place);
    form.append('PropertyAddress.City',       loc.city);
    form.append('PropertyAddress.State',      loc.state);
    form.append('PropertyAddress.Country',    'Nigeria');
    form.append('PropertyAddress.PostalCode', '100001');
    form.append('PropertyAddress.PropertyId', '00000000-0000-0000-0000-000000000000');

    try {
        const pr = await axios.post(`${API}/api/v1/Property`, form, {
            headers: { ...form.getHeaders(), Authorization:`Bearer ${owner.token}` },
            maxBodyLength: Infinity,
        });

        if (!pr.data?.isSuccessful) {
            err(`  Property ${idx} failed: ${pr.data?.message} | ${JSON.stringify(pr.data?.errors ?? {})}`);
            return null;
        }

        const pid = pr.data.data.id;
        log(`  Property ${idx} created ✓ (id:${pid} type:${propertyType} lease:${leaseType} avail:${availability})`);

        // Publish
        try {
            await axios.put(`${ADMIN}/admin/api/AdminProperty/${pid}/publish`,
                { seedKey: SEED_KEY },
                { headers: { Authorization:`Bearer ${adminToken}` } });
            log(`  Published ✓ ${pid}`);
        } catch(e) { err(`  Publish ${pid} failed: ${detail(e)}`); }

        return { id: pid, title, ownerId: owner.id };
    } catch(e) {
        err(`  Property ${idx} exception: ${detail(e)}`);
        return null;
    }
}

// ── Phase 6: Customers ────────────────────────────────────────────────────────
async function registerCustomer(index, adminToken) {
    const email = `customer_seed_${index}_${Date.now()}@realestacy.com`;
    const pwd   = 'Password123!';
    try {
        const r = await axios.post(`${API}/api/v1/Auth/register`, {
            firstName:'Customer', lastName:`${index}`, email,
            phoneNumber:`070${Math.floor(10000000+Math.random()*90000000)}`,
            password: pwd, customerType:1,
        });
        if (!r.data.isSuccessful) { err(`Customer ${index} reg failed: ${r.data.message}`); return null; }
        await verifyEmail(email, adminToken);
        log(`  Customer ${index}: ${email}`);
        return { email, id: r.data.data?.id };
    } catch(e) { err(`Customer ${index} exception: ${detail(e)}`); return null; }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {

    // 1. Admin
    const adminToken = await loginAdmin();
    if (!adminToken) { err('Cannot proceed without admin token.'); return save(); }

    // 2. Probe verify-email
    await probeVerifyEmail(adminToken);

    // 3. Log in existing owners
    log('PHASE 3 — Existing owner accounts...');
    const existingOwners = await loginExistingOwners();
    for (const o of existingOwners) results.owners.push({ id: o.id, email: o.email });

    // 4. New owners (3 new ones)
    log('PHASE 4 — New owner registrations...');
    const newOwners = [];
    for (let i = 1; i <= 3; i++) {
        const o = await registerAndLoginOwner(i, adminToken);
        if (o) { newOwners.push(o); results.owners.push({ id: o.id, email: o.email }); }
    }

    const allOwners = [...existingOwners, ...newOwners];
    log(`Total active owners: ${allOwners.length}`);

    // 5. Properties — 10 per owner
    log('PHASE 5 — Creating & publishing properties...');
    let propIdx = 0;
    for (const owner of allOwners) {
        log(`  → Properties for ${owner.email}:`);
        for (let j = 0; j < 10; j++) {
            const prop = await createProperty(owner, ++propIdx, adminToken);
            if (prop) results.properties.push(prop);
            await sleep(200);
        }
    }

    // 6. Customers
    log('PHASE 6 — Registering customers...');
    for (let i = 1; i <= 5; i++) {
        const c = await registerCustomer(i, adminToken);
        if (c) results.customers.push(c);
    }

    // Summary
    log('');
    log('═══════════ SEED COMPLETE ═══════════');
    log(`Admins:     ${results.admins.length}`);
    log(`Owners:     ${results.owners.length}`);
    log(`Properties: ${results.properties.length}`);
    log(`Customers:  ${results.customers.length}`);
    log(`Errors:     ${results.errors.length}`);
    if (results.errors.length) {
        log('Errors encountered:');
        results.errors.forEach(e => log('  • ' + e));
    }

    save();
}

function save() {
    const out = path.join(__dirname, 'seed_run_results.json');
    fs.writeFileSync(out, JSON.stringify(results, null, 2));
    console.log(`\nResults → ${out}`);
}

main().catch(e => { console.error('Fatal:', e); save(); });
