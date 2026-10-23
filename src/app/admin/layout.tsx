'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  ShieldCheck,
  FileText,
  Loader2,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<string>('sss@bhavyafashions.com');
  const [adminRole, setAdminRole] = useState<string>('Super Admin');

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }
    const authStatus = typeof window !== 'undefined' ? localStorage.getItem('bhavya_admin_auth') : null;
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('bhavya_admin_user') : null;
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('bhavya_admin_role') : null;

    if (authStatus === 'authenticated') {
      setIsAuthenticated(true);
      if (userEmail) setAdminUser(userEmail);
      if (userRole) {
        setAdminRole(userRole === 'super_admin' ? 'Super Admin' : userRole.toUpperCase());
      }
    } else {
      setIsAuthenticated(false);
      router.push('/admin/login');
    }
  }, [pathname, router]);

  // If login page, render without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bhavya_admin_auth');
      localStorage.removeItem('bhavya_admin_user');
      document.cookie = 'bhavya_admin_auth=; path=/; max-age=0';
    }
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Layers },
    { label: 'Collections', href: '/admin/collections', icon: FolderTree },
    { label: 'Catalogs', href: '/admin/catalogs', icon: BookOpen },
    { label: 'Catalog Builder', href: '/admin/catalogs/create', icon: PlusCircle, highlight: true },
    { label: 'Wholesale Inquiries', href: '/admin/inquiries', icon: MessageSquare },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Blog Posts', href: '/admin/blogs', icon: FileText },
    { label: 'Staff & Roles', href: '/admin/staff', icon: ShieldCheck },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#722F37] animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#78716C] font-semibold">
            Verifying Super Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-[#1C1917] text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#3E3835]">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-serif-luxury text-lg font-bold text-white tracking-tight">
            BHAVYA <span className="text-[#C5A059] italic font-normal">Admin</span>
          </span>
          <span className="text-[9px] bg-[#C5A059] text-black px-1.5 py-0.5 rounded font-mono font-bold">
            GEXART
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
                <div>
                  <span className="font-serif-luxury text-xl font-bold text-white">
                    BHAVYA <span className="text-[#C5A059] italic font-normal">Fashions</span>
                  </span>
                  <div className="text-[9px] font-mono text-[#C5A059] font-bold tracking-wider mt-0.5">
                    ⚡ GEXART TECHNOLOGIES STAMP
                  </div>
                </div>
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
              <div className="bg-[#141211] p-3 rounded-lg border border-[#2E2825] text-xs">
                <a
                  href="https://www.gexart.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C5A059] font-bold text-[11px] block tracking-wide hover:underline"
                >
                  ⚡ GEXART TECHNOLOGIES
                </a>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-950/60 text-red-200 border border-red-800/50 text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
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
        <div className="space-y-5">
          {/* Gexart Top Stamp */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#2E2825] border border-[#3E3835] text-[10px] font-mono text-[#C5A059]">
            <div className="flex items-center gap-1.5 font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>GEXART TECHNOLOGIES</span>
            </div>
            <span className="text-[9px] text-[#A8A29E]">v3.4</span>
          </div>

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

        <div className="pt-5 border-t border-[#2E2825] space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-xs text-[#A8A29E] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Public Website</span>
          </Link>

          {/* Gexart Bottom Stamp */}
          <div className="bg-[#141211] p-3 rounded-xl border border-[#2E2825] space-y-1">
            <div className="flex items-center justify-between text-[9px] font-mono uppercase">
              <span className="text-[#A8A29E]">Platform Engine</span>
              <span className="text-[#C5A059] font-bold">Verified ✓</span>
            </div>
            <a
              href="https://www.gexart.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-white hover:text-[#C5A059] transition-colors block"
            >
              Built by Gexart Technologies
            </a>
          </div>

          {/* User Signout Row */}
          <div className="bg-[#2E2825] p-3 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase text-[#C5A059] font-mono font-bold block">
                {adminRole}
              </span>
              <span className="font-mono text-white text-[11px] truncate block max-w-[130px]" title={adminUser}>
                {adminUser}
              </span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-[#A8A29E] hover:text-red-400 hover:bg-black/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Global Admin Footer Watermark */}
        <footer className="mt-auto py-4 px-6 border-t border-[#E7E0D5] bg-[#FAF7F2]/90 flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif-luxury font-bold text-[#1C1917]">Bhavya Fashions Wholesale B2B</span>
            <span className="hidden sm:inline">•</span>
            <span className="font-mono text-[11px] text-[#722F37] bg-[#722F37]/10 px-2 py-0.5 rounded font-bold">
              Super Admin Desk
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.gexart.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-[#1C1917] hover:text-[#722F37] transition-colors group"
            >
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
              <span>Built &amp; Protected by <u>Gexart Technologies</u></span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
