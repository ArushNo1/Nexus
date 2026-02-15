import Link from 'next/link';

export default function CreateNavbar() {
    return (
        <nav className="fixed top-0 w-full z-40 bg-[#0d281e]/90 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-8 py-4 flex items-center">
                <Link href="/landing" className="flex items-center gap-3">
                    <img src="/NEXUSLOGO.png" alt="Nexus" className="w-10 h-10 object-contain" />
                    <span className="text-xl text-white font-serif-display">Nexus</span>
                </Link>
            </div>
        </nav>
    );
}
