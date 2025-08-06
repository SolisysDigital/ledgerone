import Navigation from "@/components/Navigation";

export default function HomePage() {
  return (
    <div className="flex h-screen">
      <Navigation />
      <main className="flex-1 overflow-auto">
        <div className="min-h-full bg-gradient-to-br from-orange-50 via-pink-50 via-blue-50 to-purple-100">
          <div className="max-w-7xl mx-auto p-6">
            <div className="text-center py-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to LedgerOne
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Comprehensive Entity Management System
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Entity Management
                  </h3>
                  <p className="text-gray-600">
                    Manage entities, contacts, and relationships with ease.
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Financial Tracking
                  </h3>
                  <p className="text-gray-600">
                    Track bank accounts, investments, and financial data.
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Secure Access
                  </h3>
                  <p className="text-gray-600">
                    Role-based access control and secure authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
