import AdminNavbar from "@/components/layout/AdminNavbar";
import AdminFooter from "@/components/layout/AdminFooter";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            <AdminNavbar />
            <main className="max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-20 flex-1 w-full">
                {children}
            </main>
            <AdminFooter />
        </div>
    );
}
