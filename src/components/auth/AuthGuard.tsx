'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
    '/',
    '/forgot-password',
    '/reset-password',
    '/create-new-password',
    '/verify-email',
];

// Patterns for dynamic public routes (e.g., /property/123)
const PUBLIC_ROUTE_PATTERNS = [
    /^\/api\/seed.*$/,
];

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || 
                             PUBLIC_ROUTE_PATTERNS.some(pattern => pattern.test(pathname));

        if (!isPublicRoute && !isAuthenticated) {
            router.push('/');
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, pathname, router]);

    if (isChecking) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
                <div className="w-12 h-12 border-4 border-primary-dark border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return <>{children}</>;
}
