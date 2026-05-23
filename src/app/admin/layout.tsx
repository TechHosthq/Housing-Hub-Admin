import AdminNavbar from "@/components/layout/AdminNavbar";
import Footer from "@/components/layout/Footer";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <AdminNavbar />
            <main className="max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-20">
                {children}
            </main>
            <Footer />
        </div>
    );
}
