# Real-estacy Admin Frontend

## Seeded Database Credentials (Working)

**Admin Accounts:**
1. **Email:** `ugoluwa@gmail.com`
   **Password:** `Father+1`
2. **Email:** `admin_demo_1779285163092@realestacy.com`
   **Password:** `Password123!`

**Verified Owner Account (Can create properties):**
1. **Email:** `jeremyvictor788@gmail.com`
   **Password:** `Saladin123!@#`

**Newly Registered Owner Accounts (Currently unverified due to API bug):**
1. **Email:** `owner_seed_1_1779284973105@realestacy.com`
   **Password:** `Password123!`
2. **Email:** `owner_seed_2_1779284976381@realestacy.com`
   **Password:** `Password123!`
3. **Email:** `owner_seed_3_1779284979281@realestacy.com`
   **Password:** `Password123!`

*(Note: The 3 newly created owners cannot log in yet because the `/verify-email` endpoint on the backend is returning a 404/Invalid Token error. Use `jeremyvictor788@gmail.com` for any testing that requires property creation).*

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
