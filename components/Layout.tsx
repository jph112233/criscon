import Link from 'next/link';
import { HomeIcon } from '@heroicons/react/24/outline';

export interface LayoutProps {
  children: React.ReactNode;
  onShowDetails?: () => void;
}

export default function Layout({ children, onShowDetails }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link 
                href="/"
                className="flex items-center text-green-600 hover:text-green-800 transition-colors"
              >
                <HomeIcon className="h-6 w-6 mr-2" />
                <span className="font-semibold">CRIS Con Home</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              {onShowDetails && (
                <>
                  <button
                    onClick={onShowDetails}
                    className="text-green-600 hover:text-green-800"
                  >
                    Event Details
                  </button>
                  <span className="text-gray-300">|</span>
                </>
              )}
              <Link href="/events" className="text-green-600 hover:text-green-800">
                Manage Events
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        {children}
      </main>
    </div>
  );
} 