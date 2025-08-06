'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  Globe, 
  CreditCard, 
  Wallet, 
  Database, 
  Server, 
  BarChart3, 
  FileText, 
  Activity,
  LogOut,
  User
} from 'lucide-react';

const navigationItems = [
  { name: 'Home', href: '/home', icon: BarChart3 },
  { name: 'Entities', href: '/entities', icon: Building2 },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Emails', href: '/emails', icon: Mail },
  { name: 'Phones', href: '/phones', icon: Phone },
  { name: 'Websites', href: '/websites', icon: Globe },
  { name: 'Bank Accounts', href: '/bank-accounts', icon: CreditCard },
  { name: 'Investment Accounts', href: '/investment-accounts', icon: Wallet },
  { name: 'Crypto Accounts', href: '/crypto-accounts', icon: Database },
  { name: 'Credit Cards', href: '/credit-cards', icon: CreditCard },
  { name: 'Hosting Accounts', href: '/hosting-accounts', icon: Server },
  { name: 'Admin Logs', href: '/admin/logs', icon: Activity },
];

export default function Navigation() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-white/90 backdrop-blur-sm border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">LedgerOne</h1>
            <p className="text-xs text-gray-500">Entity Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full mt-2 text-xs text-gray-600 hover:text-red-600"
          >
            <LogOut className="h-3 w-3 mr-1" />
            Logout
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © 2024 LedgerOne
        </p>
      </div>
    </div>
  );
} 