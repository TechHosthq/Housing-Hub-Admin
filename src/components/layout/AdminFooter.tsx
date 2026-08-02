import packageJson from "../../../package.json";

export default function AdminFooter() {
    return (
        <footer className="border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-gray-400 font-medium">
                <span>
                    &copy; {new Date().getFullYear()} HousingHub Admin. All rights reserved.
                    <span className="mx-2 text-gray-200">&bull;</span>
                    v{packageJson.version}
                </span>
                <div className="flex items-center gap-6">
                    <a href="mailto:support@housinghub.ng" className="hover:text-[#0095FF] transition-colors">
                        Support
                    </a>
                </div>
            </div>
        </footer>
    );
}
