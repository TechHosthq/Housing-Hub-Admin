import Navbar from "@/components/layout/Navbar";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="flex min-h-screen pt-16">
                {/* Left Side - Image Background */}
                <div
                    className="hidden md:block w-1/2 bg-cover bg-center"
                    style={{
                        backgroundImage: 'url("/images/hero-bg.png")',
                    }}
                />

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
                    <LoginForm />
                </div>
            </div>
        </main>
    );
}
