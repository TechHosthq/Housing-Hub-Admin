import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#07358B] text-white pt-24 pb-16 px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-20 mb-16">
                <div className="space-y-6">
                    <div className="flex items-center">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/images/footerlogo.png"
                            alt="Housing Hub Logo"
                            width={180}
                            height={45}
                            className="w-auto h-12 object-contain"
                            />
                    </Link>
                    <h4 className="font-bold text-3xl" style={{color:"#EDCC27"}}>Housing Hub</h4>
                    </div>
                    <p className="text-white/80 text-base font-medium max-w-[196px]">
                        Find Verified Properties And Book Inspections With Ease.
                    </p>
                </div>

                <div>
                    <h4 className="text-xl mb-8 text-white" style={{color:"#FFFFFF"}}>For Customers</h4>
                    <ul className="space-y-4 text-white/70 text-base font-medium">
                        <li><Link href="#" className="hover:text-white transition-colors">Search Properties</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Request Inspection</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Track Status</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Profile & KYC</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-xl mb-8 text-white" style={{color:"#FFFFFF"}}>For Homeowners</h4>
                    <ul className="space-y-4 text-white/70 text-base font-medium">
                        <li><Link href="#" className="hover:text-white transition-colors">List properties</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Manage Listings</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Inspection Requests</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">KYC Verification</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-xl mb-8 text-white" style={{color:"#FFFFFF"}}>Support</h4>
                    <ul className="space-y-4 text-white/70 text-base font-medium">
                        <li><Link href="#" className="hover:text-white transition-colors">Contact Us</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-white/5 pt-10 text-center text-white/30 text-xs font-bold tracking-widest uppercase">
                © {new Date().getFullYear()} HOUSING HUB. ALL RIGHTS RESERVED.
            </div>
        </footer>
    );
}
