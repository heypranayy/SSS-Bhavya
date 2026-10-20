'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  UserX,
  UserCheck,
  KeyRound,
  ShieldAlert,
  Search,
  Check,
  Activity,
  Lock,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Building2,
  Key,
} from 'lucide-react';

export type StaffRole = 'super_admin' | 'admin' | 'catalog_manager' | 'sales_staff' | 'read_only';

export interface StaffAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: StaffRole;
  hub: 'Kolkata Barabazar' | 'Surat Unit' | 'All Hubs';
  status: 'active' | 'suspended';
  lastActive: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  staffName: string;
  action: string;
  category: 'catalog' | 'inquiry' | 'product' | 'security' | 'staff';
}

const INITIAL_STAFF: StaffAccount[] = [
  {
    id: 'staff-1',
    name: 'Super Administrator',
    email: 'sss@bhavyafashions.com',
    password: 'Bhavya@2026',
    role: 'super_admin',
    hub: 'All Hubs',
    status: 'active',
    lastActive: 'Just now',
  },
  {
    id: 'staff-2',
    name: 'Amit Verma',
    email: 'amit.verma@bhavyafashions.com',
    password: 'Bhavya@2026',
    role: 'sales_staff',
    hub: 'Kolkata Barabazar',
    status: 'active',
    lastActive: '10 mins ago',
  },
  {
    id: 'staff-3',
    name: 'Sanjay Jain',
    email: 'sanjay.jain@bhavyafashions.com',
    password: 'Bhavya@2026',
    role: 'catalog_manager',
    hub: 'Kolkata Barabazar',
    status: 'active',
    lastActive: '1 hour ago',
  },
  {
    id: 'staff-4',
    name: 'Ravi Sharma',
    email: 'ravi.sharma@bhavyafashions.com',
    password: 'Bhavya@2026',
    role: 'sales_staff',
    hub: 'Surat Unit',
    status: 'active',
    lastActive: '3 hours ago',
  },
  {
    id: 'staff-5',
    name: 'Priya Mukherjee',
    email: 'priya.m@bhavyafashions.com',
    role: 'read_only',
    hub: 'Kolkata Barabazar',
    status: 'suspended',
    lastActive: '3 days ago',
  },
];

const INITIAL_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    timestamp: 'Today at 12:45 PM',
    staffName: 'Amit Verma',
    action: 'Assigned and initiated WhatsApp quote for BF-CAT-78214 (Radha Krishna Ethnic Hub)',
    category: 'inquiry',
  },
  {
    id: 'log-2',
    timestamp: 'Today at 11:20 AM',
    staffName: 'Sanjay Jain',
    action: 'Published new hybrid catalog: bhavya-vip-summer-2026 with 64 products',
    category: 'catalog',
  },
  {
    id: 'log-3',
    timestamp: 'Yesterday at 5:15 PM',
    staffName: 'Super Administrator',
    action: 'Completed legacy WordPress data import: 64 products and 3 articles reconciled',
    category: 'security',
  },
  {
    id: 'log-4',
    timestamp: 'Yesterday at 3:30 PM',
    staffName: 'Ravi Sharma',
    action: 'Updated inventory status for DN11059 (Kesaria Silk) in Surat warehouse',
    category: 'product',
  },
];

const ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  super_admin: 'Full system control, staff management, catalog deletion, billing, and system settings.',
  admin: 'Product catalog management, customer management, inquiry assignments, and catalog creation.',
  catalog_manager: 'Curate, filter, and share wholesale lookbooks, manage categories and collections.',
  sales_staff: 'Access inquiries, communicate on WhatsApp, update procurement lead status.',
  read_only: 'View-only access to catalog products and inventory counts.',
};

export function StaffManager() {
  const [staffList, setStaffList] = useState<StaffAccount[]>(INITIAL_STAFF);
  const [logs, setLogs] = useState<ActivityLogItem[]>(INITIAL_LOGS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'staff' | 'permissions' | 'logs'>('staff');
  const [showAddModal, setShowAddModal] = useState(false);

  // New staff form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Bhavya@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [newRole, setNewRole] = useState<StaffRole>('sales_staff');
  const [newHub, setNewHub] = useState<'Kolkata Barabazar' | 'Surat Unit' | 'All Hubs'>('Kolkata Barabazar');

  // Edit password modal state
  const [passwordModalStaff, setPasswordModalStaff] = useState<StaffAccount | null>(null);
  const [editPasswordValue, setEditPasswordValue] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('bhavya_staff_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStaffList(parsed);
        }
      }
    } catch {}
  }, []);

  const saveStaffList = (updated: StaffAccount[]) => {
    setStaffList(updated);
    try {
      localStorage.setItem('bhavya_staff_accounts', JSON.stringify(updated));
    } catch {}
  };

  const filteredStaff = staffList.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (id: string) => {
    const updated = staffList.map((s) => {
      if (s.id === id) {
        const newStatus = s.status === 'active' ? 'suspended' : 'active';
        setLogs((prevLogs) => [
          {
            id: `log-${Date.now()}`,
            timestamp: 'Just now',
            staffName: 'Super Administrator',
            action: `${newStatus === 'active' ? 'Restored' : 'Revoked'} access for staff: ${s.name}`,
            category: 'staff',
          },
          ...prevLogs,
        ]);
        return { ...s, status: newStatus as any };
      }
      return s;
    });
    saveStaffList(updated);
  };

  const handleRoleChange = (id: string, newRole: StaffRole) => {
    const updated = staffList.map((s) => (s.id === id ? { ...s, role: newRole } : s));
    saveStaffList(updated);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newStaff: StaffAccount = {
      id: `staff-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      password: newPassword.trim() || 'Bhavya@2026',
      role: newRole,
      hub: newHub,
      status: 'active',
      lastActive: 'Never',
    };

    saveStaffList([newStaff, ...staffList]);
    setLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        staffName: 'Super Administrator',
        action: `Created new staff account for ${newName.trim()} (${newRole}) with custom password`,
        category: 'staff',
      },
      ...logs,
    ]);

    setNewName('');
    setNewEmail('');
    setNewPassword('Bhavya@2026');
    setShowAddModal(false);
  };

  const handleSavePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalStaff || !editPasswordValue.trim()) return;

    const updated = staffList.map((s) =>
      s.id === passwordModalStaff.id ? { ...s, password: editPasswordValue.trim() } : s
    );
    saveStaffList(updated);

    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: 'Just now',
        staffName: 'Super Administrator',
        action: `Updated password for staff account: ${passwordModalStaff.name} (${passwordModalStaff.email})`,
        category: 'security',
      },
      ...prev,
    ]);

    setPasswordModalStaff(null);
    setEditPasswordValue('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            Access Control & Security
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Staff Accounts & Role-Based Permissions
          </h1>
          <p className="text-xs text-[#78716C] mt-1">
            Super Administrator controls staff access across Kolkata Barabazar and Surat textile hubs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24] shadow-md transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E7E0D5] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'staff' ? 'bg-[#722F37] text-white' : 'text-[#78716C] hover:bg-[#EFE9E0]'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Active Staff ({staffList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'permissions' ? 'bg-[#722F37] text-white' : 'text-[#78716C] hover:bg-[#EFE9E0]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Permission Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
            activeTab === 'logs' ? 'bg-[#722F37] text-white' : 'text-[#78716C] hover:bg-[#EFE9E0]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Audit Trail</span>
        </button>
      </div>

      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search staff by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-[#E7E0D5] bg-white"
            />
          </div>

          {/* Staff Cards List */}
          <div className="bg-white rounded-2xl border border-[#E7E0D5] overflow-hidden shadow-xs divide-y divide-[#F3ECE2]">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                      {staff.name}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        staff.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {staff.status === 'active' ? '● Active' : '● Revoked / Suspended'}
                    </span>
                    <span className="text-[11px] text-[#78716C] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E7E0D5]">
                      {staff.hub}
                    </span>
                  </div>

                  <p className="text-xs text-[#78716C] font-mono">{staff.email}</p>
                  <p className="text-[11px] text-[#A8A29E]">Last active: {staff.lastActive}</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#78716C] block mb-0.5">
                      Assigned Role:
                    </label>
                    <select
                      value={staff.role}
                      onChange={(e) => handleRoleChange(staff.id, e.target.value as StaffRole)}
                      disabled={staff.role === 'super_admin'}
                      className="text-xs py-1.5 px-2.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-semibold text-[#1C1917] disabled:opacity-50"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="catalog_manager">Catalog Manager</option>
                      <option value="sales_staff">Sales Staff</option>
                      <option value="read_only">Read-Only Staff</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPasswordModalStaff(staff);
                      setEditPasswordValue(staff.password || 'Bhavya@2026');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] text-xs font-semibold text-[#1C1917] hover:bg-[#EFE9E0] transition-colors"
                    title="Change Account Password"
                  >
                    <Key className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Password</span>
                  </button>

                  {staff.role !== 'super_admin' && (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(staff.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors mt-3 sm:mt-0 ${
                        staff.status === 'active'
                          ? 'border border-red-200 text-red-700 hover:bg-red-50'
                          : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {staff.status === 'active' ? 'Revoke Access' : 'Reactivate'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white rounded-2xl border border-[#E7E0D5] p-6 space-y-6 shadow-xs">
          <h2 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
            Configurable Role Permissions Matrix
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E7E0D5] text-[#78716C] uppercase font-mono">
                  <th className="pb-3 font-semibold">Permission Area</th>
                  <th className="pb-3 text-center">Super Admin</th>
                  <th className="pb-3 text-center">Admin</th>
                  <th className="pb-3 text-center">Catalog Manager</th>
                  <th className="pb-3 text-center">Sales Staff</th>
                  <th className="pb-3 text-center">Read-Only</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECE2]">
                {[
                  { name: 'Product Catalog (Add/Edit)', sa: true, ad: true, cm: true, ss: false, ro: false },
                  { name: 'Bulk Product Import & CSV Export', sa: true, ad: true, cm: true, ss: false, ro: false },
                  { name: 'Dynamic Catalog Builder & Publishing', sa: true, ad: true, cm: true, ss: false, ro: false },
                  { name: 'Revoke / Expire Catalogs', sa: true, ad: true, cm: true, ss: false, ro: false },
                  { name: 'View Website & Catalog Inquiries', sa: true, ad: true, cm: true, ss: true, ro: true },
                  { name: 'Assign Staff & Update Inquiry Status', sa: true, ad: true, cm: false, ss: true, ro: false },
                  { name: 'Customer Pricing Tiers & Discounts', sa: true, ad: true, cm: false, ss: false, ro: false },
                  { name: 'WhatsApp & System Configuration', sa: true, ad: false, cm: false, ss: false, ro: false },
                  { name: 'Staff Management & Access Revocation', sa: true, ad: false, cm: false, ss: false, ro: false },
                  { name: 'Security & Activity Logs', sa: true, ad: true, cm: false, ss: false, ro: false },
                ].map((perm, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF7F2]/50">
                    <td className="py-3 font-medium text-[#1C1917]">{perm.name}</td>
                    <td className="py-3 text-center">{perm.sa ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-[#A8A29E] mx-auto" />}</td>
                    <td className="py-3 text-center">{perm.ad ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-[#A8A29E] mx-auto" />}</td>
                    <td className="py-3 text-center">{perm.cm ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-[#A8A29E] mx-auto" />}</td>
                    <td className="py-3 text-center">{perm.ss ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-[#A8A29E] mx-auto" />}</td>
                    <td className="py-3 text-center">{perm.ro ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <Lock className="w-3.5 h-3.5 text-[#A8A29E] mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-[#E7E0D5] p-6 space-y-4 shadow-xs">
          <h2 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
            Security Audit Trail & Activity Log
          </h2>

          <div className="divide-y divide-[#F3ECE2] border border-[#E7E0D5] rounded-xl overflow-hidden bg-white">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1C1917]">{log.staffName}</span>
                    <span className="bg-[#FAF7F2] text-[#722F37] font-mono text-[10px] px-1.5 py-0.2 rounded border">
                      {log.category.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[#57534E] leading-relaxed">{log.action}</p>
                </div>
                <span className="text-[#78716C] whitespace-nowrap text-[11px] shrink-0 font-mono">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E7E0D5]">
            <div className="border-b border-[#F3ECE2] pb-3">
              <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                Add New Staff Account
              </h3>
              <p className="text-xs text-[#78716C]">
                Configure staff credentials and assign appropriate role permissions.
              </p>
            </div>

            <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1C1917] mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deepak Parekh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1917] mb-1">Company Email *</label>
                <input
                  type="email"
                  required
                  placeholder="deepak@bhavyafashions.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1C1917] mb-1">Login Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Set user password (e.g. Bhavya@2026)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full py-2 pl-3 pr-10 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-[#78716C] mt-1">
                  User will use this exact password to sign in to the portal.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1917] mb-1">Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as StaffRole)}
                  className="w-full py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                >
                  <option value="admin">Admin</option>
                  <option value="catalog_manager">Catalog Manager</option>
                  <option value="sales_staff">Sales Staff</option>
                  <option value="read_only">Read-Only Staff</option>
                </select>
                <p className="text-[11px] text-[#78716C] mt-1">
                  {ROLE_DESCRIPTIONS[newRole]}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1917] mb-1">Assigned Hub</label>
                <select
                  value={newHub}
                  onChange={(e) => setNewHub(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
                >
                  <option value="Kolkata Barabazar">Kolkata Barabazar Showroom</option>
                  <option value="Surat Unit">Surat Manufacturing Hub</option>
                  <option value="All Hubs">All Hubs</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#722F37] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5C1D24]"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Password Modal */}
      {passwordModalStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E7E0D5] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D5]">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#722F37]" />
                <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                  Reset User Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalStaff(null)}
                className="text-zinc-400 hover:text-zinc-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePasswordChange} className="space-y-4 text-xs">
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E7E0D5] space-y-1">
                <span className="font-bold text-[#1C1917] block">{passwordModalStaff.name}</span>
                <span className="text-[#78716C] font-mono text-[11px] block">{passwordModalStaff.email}</span>
              </div>

              <div>
                <label className="block font-semibold text-[#1C1917] mb-1">New Password *</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter new password"
                    value={editPasswordValue}
                    onChange={(e) => setEditPasswordValue(e.target.value)}
                    className="w-full py-2 pl-3 pr-10 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalStaff(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#78716C] hover:text-[#1C1917]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#722F37] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5C1D24]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
