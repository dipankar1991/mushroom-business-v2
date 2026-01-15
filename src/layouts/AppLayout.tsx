import { Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PlusCircle, Sprout, Package } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have utils for cn/dls

export default function AppLayout() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Header */}
            <header className="bg-primary hover:bg-green-700 transition-colors text-white p-4 shadow-md sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Branding */}
                    <Sprout className="h-6 w-6" />
                    <h1 className="text-xl font-bold tracking-tight">MushroomBiz</h1>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/" className={cn("text-sm font-medium hover:text-green-200 transition-colors", isActive('/') && "text-white font-bold underline decoration-2 underline-offset-4")}>Dashboard</Link>
                    <Link to="/transactions" className={cn("text-sm font-medium hover:text-green-200 transition-colors", isActive('/transactions') && "text-white font-bold underline decoration-2 underline-offset-4")}>Transactions</Link>
                    <Link to="/batches" className={cn("text-sm font-medium hover:text-green-200 transition-colors", isActive('/batches') && "text-white font-bold underline decoration-2 underline-offset-4")}>Batches</Link>
                    <Link to="/add" className="bg-white text-primary hover:bg-green-50 px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-transform hover:scale-105 flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        New Entry
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 container max-w-md mx-auto p-4 pb-24">
                {/* max-w-md ensures it looks like a mobile app even on desktop */}
                <Outlet />
            </main>

            {/* Bottom Navigation for Mobile Feel */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] pb-safe pt-2 px-6 flex justify-between items-center z-50 h-16 md:hidden">

                <Link
                    to="/"
                    className={cn(
                        "flex flex-col items-center gap-1 transition-colors",
                        isActive('/') ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <LayoutDashboard className="h-6 w-6" />
                    <span className="text-xs font-medium">Home</span>
                </Link>

                <Link
                    to="/batches" // New Batches link for mobile
                    className={cn(
                        "flex flex-col items-center gap-1 transition-colors",
                        isActive('/batches') ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <Package className="h-6 w-6" />
                    <span className="text-xs font-medium">Batches</span>
                </Link>

                <Link
                    to="/add"
                    className="flex flex-col items-center justify-center -mt-8"
                >
                    {/* Floating Action Button style for 'Add' */}
                    <div className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transition-all">
                        <PlusCircle className="h-7 w-7" />
                    </div>
                    <span className="text-xs font-medium text-primary mt-1">Add</span>
                </Link>

                <Link
                    to="/transactions"
                    className={cn(
                        "flex flex-col items-center gap-1 transition-colors",
                        isActive('/transactions') ? "text-primary" : "text-gray-400 hover:text-gray-600"
                    )}
                >
                    <ClipboardList className="h-6 w-6" />
                    <span className="text-xs font-medium">History</span>
                </Link>

            </nav>
        </div>
    );
}
