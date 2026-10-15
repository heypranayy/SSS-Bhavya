'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  PlusCircle,
  Users,
  MessageSquare,
  Settings,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  LogOut,
  FolderTree,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // If login page, render without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Layers },
    { label: 'Collections', href: '/admin/collections', icon: FolderTree },
    { label: 'Catalogs', href: '/admin/catalogs', icon: BookOpen },
    { label: 'Catalog Builder', href: '/admin/catalogs/create', icon: PlusCircle, highlight: true },
    { label: 'Wholesale Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#1C1917] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#3E3835]">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-serif-luxury text-lg font-bold text-white tracking-tight">
            BHAVYA <span className="text-[#C5A059] italic font-normal">Admin</span>
          </span>
          <span className="text-[10px] bg-[#722F37] text-white px-2 py-0.5 rounded uppercase font-semibold">
            B2B
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/catalogs/create"
            className="p-1.5 rounded bg-[#722F37] text-white text-xs font-semibold flex items-center gap-1"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-[10px] uppercase">New Catalog</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded text-[#E7E0D5] hover:bg-[#2E2825]"
            aria-label="Toggle admin navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex">
          <div className="bg-[#1C1917] w-4/5 max-w-xs h-full text-[#E7E0D5] p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#2E2825]">
                <span className="font-serif-luxury text-xl font-bold text-white">
                  BHAVYA <span className="text-[#C5A059] italic font-normal">Fashions</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-[#A8A29E]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#722F37] text-white'
                          : 'text-[#A8A29E] hover:bg-[#2E2825] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                      {item.highlight && (
                        <span className="ml-auto text-[9px] bg-[#C5A059] text-black px-1.5 py-0.5 rounded font-bold">
                          Core
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#2E2825] space-y-3">
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 text-xs text-[#A8A29E] hover:text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Website</span>
              </Link>
              <div className="text-[10px] text-[#78716C]">
                Admin Session Active • Bhavya Fashions B2B
              </div>
            </div>
          </div>

          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1C1917] text-[#E7E0D5] p-5 shrink-0 min-h-screen justify-between border-r border-[#2E2825]">
        <div className="space-y-6">
          <div className="pb-4 border-b border-[#2E2825]">
            <Link href="/admin" className="block">
              <span className="font-serif-luxury text-xl font-bold text-white tracking-tight">
                BHAVYA <span className="text-[#C5A059] italic font-normal">Fashions</span>
              </span>
              <p className="text-[10px] uppercase tracking-widest text-[#A8A29E] mt-0.5 font-medium">
                Wholesale Administration
              </p>
            </Link>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#722F37] text-white shadow-xs'
                      : 'text-[#A8A29E] hover:bg-[#2E2825] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[9px] bg-[#C5A059] text-black px-1.5 py-0.5 rounded font-bold">
                      Build
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#2E2825] space-y-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-[#A8A29E] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Website</span>
          </Link>

          <div className="bg-[#2E2825] p-3 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase text-[#A8A29E] block">Administrator</span>
              <span className="font-bold text-white text-xs">Wholesale Desk</span>
            </div>
            <Link
              href="/admin/login"
              className="text-[#A8A29E] hover:text-white"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
