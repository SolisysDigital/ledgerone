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
                LedgerOne is a personal and business information manager app. It is designed for comprehensive management of entities, contacts, and various financial accounts.
              </p>
              
              <div className="max-w-4xl mx-auto mb-12 text-left">
                <p className="text-gray-700 mb-6">
                  It provides a secure and intuitive platform for individuals and small businesses to organize and track critical information,
                </p>
                
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2 ml-4">
                  <li>Track all your contacts, emails, websites, hosting plans, Investment accounts, bank accounts and card accounts. Relate the contacts and accounts to your business and personal entities.</li>
                  <li>At a glance see what emails are associated with what accounts. Example I use Test@gmail.com for bank account 1 etc.</li>
                </ul>
                
                <p className="text-gray-700 mb-8">
                  The user interface is designed for clarity and ease of use. The navigation panel provides quick access to different data categories, while the global search bar allows for rapid information retrieval. Data tables are presented clearly, with options for viewing, editing, and visualizing relationships, ensuring an efficient workflow for managing complex information.
                </p>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-md">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Additional details</h2>
                  <p className="text-gray-700 mb-6">
                    LedgerOne is an app designed for comprehensive management of entities, contacts, and various financial accounts. It provides a secure and intuitive platform for individuals and small businesses to organize and track critical information, offering a unified view of diverse data points.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                    <li><strong>Information Management:</strong> Create and manage detailed profiles for various entities, including individuals, organizations, and assets.</li>
                    <li><strong>Relationship Tracking:</strong> Establish and visualize complex relationships between entities, contacts, and financial instruments.</li>
                    <li><strong>Account Management:</strong> Securely store and manage information for bank accounts, investment accounts, cryptocurrency accounts, credit cards, and hosting accounts.</li>
                    <li><strong>Contact and Communication Tracking:</strong> Maintain records of contacts, emails, and phone numbers associated with entities.</li>
                    <li><strong>Global Search Functionality:</strong> Efficiently search across all stored data with a powerful, unified search view.</li>
                    <li><strong>Comprehensive Logging:</strong> Detailed application logging for monitoring activities, errors, and debugging.</li>
                    <li><strong>Clean, Modern Design:</strong> A clean, modern, and responsive design built UI components, ensuring a consistent experience across devices.</li>
                  </ul>
                </div>
              </div>
              
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
