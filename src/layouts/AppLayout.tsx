import { Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Receipt, PlusCircle, Sprout } from 'lucide-react';
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
            </header>

            {/* Main Content Area */}
            <main className="flex-1 container max-w-md mx-auto p-4 pb-24">
                {/* max-w-md ensures it looks like a mobile app even on desktop */}
                <Outlet />
            </main>

            {/* Bottom Navigation for Mobile Feel */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-1px_10px_rgba(0,0,0,0.05)] pb-safe pt-2 px-6 flex justify-between items-center z-50 h-16">

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
                    <Receipt className="h-6 w-6" />
                    <span className="text-xs font-medium">History</span>
                </Link>

            </nav>
        </div>
    );
}
