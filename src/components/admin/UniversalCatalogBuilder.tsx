'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Product,
  Category,
  Collection,
  Customer,
  CatalogMode,
  FilterRuleGroup,
  FilterRule,
  CatalogOverride,
  CatalogPresentationSettings,
} from '@/types';
import { resolveCatalogProducts } from '@/lib/engine/filter-engine';
import { formatINR } from '@/lib/utils';
import {
  Sparkles,
  Plus,
  Trash2,
  Sliders,
  CheckSquare,
  Square,
  Pin,
  Eye,
  Send,
  Copy,
  Check,
  MessageCircle,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  RotateCcw,
  Smartphone,
  Monitor,
  Loader2,
} from 'lucide-react';

interface UniversalCatalogBuilderProps {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  customers: Customer[];
}

export function UniversalCatalogBuilder({
  products,
  categories,
  collections,
  customers,
}: UniversalCatalogBuilderProps) {
  const router = useRouter();

  // Mode: dynamic, curated, hybrid
  const [mode, setMode] = useState<CatalogMode>('hybrid');
  const [membershipType, setMembershipType] = useState<'dynamic' | 'fixed'>('dynamic');

  // Basic Info
  const [title, setTitle] = useState('Exclusive Wholesale Kurti Lookbook 2026');
  const [subtitle, setSubtitle] = useState('Direct factory supply for boutiques & fashion retailers');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerGreeting, setCustomerGreeting] = useState('');
  const [customMessage, setCustomMessage] = useState(
    'Please review our latest designs below and submit your quantity requirements. Minimum order quantity is 6 pieces per design (standard ratio pack).'
  );
  const [expiresInDays, setExpiresInDays] = useState<number>(30);

  // Dynamic Rules State
  const [ruleGroups, setRuleGroups] = useState<FilterRuleGroup[]>([
    {
      id: 'rg-1',
      logical_operator: 'AND',
      rules: [
        {
          id: 'r-1',
          attribute: 'stock_status',
          operator: 'equals',
          value: 'in_stock',
        },
        {
          id: 'r-2',
          attribute: 'base_wholesale_price',
          operator: 'less_than_or_equal',
          value: 1200,
        },
      ],
    },
  ]);

  // Overrides State: Map of productId -> CatalogOverride
  const [overrides, setOverrides] = useState<Map<string, CatalogOverride>>(new Map());

  // Search & Filters for manual selection tab
  const [curatedSearch, setCuratedSearch] = useState('');
  const [curatedCategory, setCuratedCategory] = useState('all');

  // Presentation Settings
  const [presentationSettings, setPresentationSettings] = useState<CatalogPresentationSettings>({
    layout: 'grid',
    columnsDesktop: 3,
    columnsMobile: 1,
    showPrices: true,
    showMoq: true,
    showSizes: true,
    showStockStatus: true,
    showDescription: true,
    imageAspectRatio: '3/4',
    allowSelection: true,
    allowSizeSelection: true,
    allowQuantityBreakdown: true,
    allowInquiry: true,
    allowCustomerNotes: true,
    allowAlternativeRequest: true,
  });

  // UI Tabs: 'rules' | 'selection' | 'customization' | 'preview'
  const [activeTab, setActiveTab] = useState<'rules' | 'selection' | 'customization' | 'preview'>('rules');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedToken, setPublishedToken] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Selected Customer object
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Update greeting when customer changes
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerGreeting(`Dear ${selectedCustomer.contact_person} (${selectedCustomer.business_name}),`);
    } else {
      setCustomerGreeting('');
    }
  }, [selectedCustomer]);

  // Server-side filter resolution (mirrored locally for instant reactive editing)
  const resolvedCatalogProducts = useMemo(() => {
    return resolveCatalogProducts(products, {
      mode,
      ruleGroups,
      overrides: Array.from(overrides.values()),
      customerDiscountPct: selectedCustomer?.discount_pct || 0,
    });
  }, [products, mode, ruleGroups, overrides, selectedCustomer]);

  // Add rule group
  const addRule = (groupId: string) => {
    setRuleGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            rules: [
              ...g.rules,
              {
                id: `r-${Date.now()}`,
                attribute: 'fabric',
                operator: 'contains',
                value: 'Cotton',
              },
            ],
          };
        }
        return g;
      })
    );
  };

  const removeRule = (groupId: string, ruleId: string) => {
    setRuleGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          return { ...g, rules: g.rules.filter(r => r.id !== ruleId) };
        }
        return g;
      })
    );
  };

  const updateRule = (groupId: string, ruleId: string, updates: Partial<FilterRule>) => {
    setRuleGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            rules: g.rules.map(r => (r.id === ruleId ? { ...r, ...updates } : r)),
          };
        }
        return g;
      })
    );
  };

  // Preset Filters
  const applyPreset = (presetName: string) => {
    if (presetName === 'summer_cotton') {
      setRuleGroups([
        {
          id: `rg-${Date.now()}`,
          logical_operator: 'AND',
          rules: [
            { id: 'p-1', attribute: 'fabric', operator: 'contains', value: 'Cotton' },
            { id: 'p-2', attribute: 'base_wholesale_price', operator: 'less_than_or_equal', value: 700 },
            { id: 'p-3', attribute: 'stock_status', operator: 'equals', value: 'in_stock' },
          ],
        },
      ]);
    } else if (presetName === 'muslin_luxury') {
      setRuleGroups([
        {
          id: `rg-${Date.now()}`,
          logical_operator: 'AND',
          rules: [
            { id: 'p-4', attribute: 'fabric', operator: 'contains', value: 'Muslin' },
            { id: 'p-5', attribute: 'stock_status', operator: 'equals', value: 'in_stock' },
          ],
        },
      ]);
    } else if (presetName === 'trending_alia') {
      setRuleGroups([
        {
          id: `rg-${Date.now()}`,
          logical_operator: 'AND',
          rules: [
            { id: 'p-6', attribute: 'style_type', operator: 'contains', value: 'Alia' },
          ],
        },
      ]);
    }
  };

  // Manual Overrides Management
  const toggleProductInclusion = (product: Product) => {
    setOverrides(prev => {
      const next = new Map(prev);
      const current = next.get(product.id);

      if (current?.action === 'include') {
        next.delete(product.id);
      } else {
        next.set(product.id, {
          id: `ov-${Date.now()}`,
          product_id: product.id,
          action: 'include',
          display_order: next.size,
          is_pinned: false,
        });
      }
      return next;
    });
  };

  const toggleProductExclusion = (product: Product) => {
    setOverrides(prev => {
      const next = new Map(prev);
      const current = next.get(product.id);

      if (current?.action === 'exclude') {
        next.delete(product.id);
      } else {
        next.set(product.id, {
          id: `ov-${Date.now()}`,
          product_id: product.id,
          action: 'exclude',
          display_order: 0,
        });
      }
      return next;
    });
  };

  const togglePinProduct = (productId: string) => {
    setOverrides(prev => {
      const next = new Map(prev);
      const current = next.get(productId) || {
        id: `ov-${Date.now()}`,
        product_id: productId,
        action: 'include' as const,
        display_order: 0,
        is_pinned: false,
      };

      next.set(productId, {
        ...current,
        is_pinned: !current.is_pinned,
      });
      return next;
    });
  };

  const updatePresentationNote = (productId: string, note: string) => {
    setOverrides(prev => {
      const next = new Map(prev);
      const current = next.get(productId) || {
        id: `ov-${Date.now()}`,
        product_id: productId,
        action: 'include' as const,
        display_order: 0,
      };

      next.set(productId, {
        ...current,
        presentation_note: note,
      });
      return next;
    });
  };

  // Publish Catalog
  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const expiresAt = expiresInDays > 0
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const payload = {
        title,
        subtitle,
        mode,
        membership_type: membershipType,
        customer_id: selectedCustomerId || undefined,
        customer_greeting: customerGreeting || undefined,
        custom_message: customMessage || undefined,
        expires_at: expiresAt,
        presentation_settings: presentationSettings,
        rule_groups: ruleGroups,
        overrides: Array.from(overrides.values()),
      };

      const res = await fetch('/api/catalogs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish catalog');

      setPublishedToken(data.public_token);
    } catch (err: any) {
      alert(err.message || 'Error publishing catalog');
    } finally {
      setIsPublishing(false);
    }
  };

  const shareableUrl = typeof window !== 'undefined' && publishedToken
    ? `${window.location.origin}/catalog/${publishedToken}`
    : `/catalog/${publishedToken || 'token'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const whatsappShareUrl = `https://wa.me/${selectedCustomer?.phone.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(
    `Hello ${selectedCustomer?.contact_person || 'Sir/Madam'}, here is your personalized wholesale kurti catalog from Bhavya Fashions:\n\n${shareableUrl}\n\nPlease review designs and submit your requirement directly.`
  )}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D5]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#722F37] font-bold">
            Catalog Generation Engine
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917]">
            Universal Catalog Builder
          </h1>
        </div>

        {/* Catalog Mode Pill Selector */}
        <div className="bg-white p-1 rounded-xl border border-[#E7E0D5] flex items-center shadow-2xs">
          <button
            type="button"
            onClick={() => setMode('dynamic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'dynamic' ? 'bg-[#722F37] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Mode 1: Dynamic Filter
          </button>
          <button
            type="button"
            onClick={() => setMode('curated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'curated' ? 'bg-[#722F37] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Mode 2: Curated Manual
          </button>
          <button
            type="button"
            onClick={() => setMode('hybrid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'hybrid' ? 'bg-[#722F37] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Mode 3: Hybrid (Recommended)
          </button>
        </div>
      </div>

      {/* Success Published Modal Banner */}
      {publishedToken && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-emerald-900">
                Catalog Successfully Published & Ready to Share!
              </h3>
              <p className="text-xs text-emerald-700">
                Public lookbook token: <span className="font-mono font-bold">{publishedToken}</span> ({resolvedCatalogProducts.length} designs included)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <div className="flex-1 bg-white border border-emerald-200 px-3.5 py-2.5 rounded-lg font-mono text-xs text-[#1C1917] truncate">
              {shareableUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24]"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Share Link'}</span>
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </a>

            <Link
              href={`/catalog/${publishedToken}`}
              target="_blank"
              className="inline-flex items-center justify-center gap-1 px-4 py-2.5 rounded-lg bg-white border border-[#E7E0D5] text-[#1C1917] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF7F2]"
            >
              <span>Open Lookbook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Builder Step Navigation Tabs */}
      <div className="flex items-center border-b border-[#E7E0D5] gap-4 overflow-x-auto pb-1 text-xs font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rules' ? 'border-[#722F37] text-[#722F37]' : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>1. Filter Rules ({mode === 'curated' ? 'Disabled' : 'Active'})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('selection')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'selection' ? 'border-[#722F37] text-[#722F37]' : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>2. Manual Curate & Exclude ({overrides.size} Overrides)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customization')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'customization' ? 'border-[#722F37] text-[#722F37]' : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>3. Customer & Presentation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'preview' ? 'border-[#722F37] text-[#722F37]' : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>4. Live Lookbook Preview ({resolvedCatalogProducts.length} Designs)</span>
        </button>
      </div>

      {/* TAB 1: ADVANCED FILTER BUILDER */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          {mode === 'curated' ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-xs text-amber-800 space-y-2">
              <p className="font-bold">Mode 2 (Curated Manual) is currently selected.</p>
              <p>Dynamic filter rules are bypassed. Please proceed to the "Manual Curate & Exclude" tab to hand-pick designs, or switch mode to Hybrid.</p>
              <button
                type="button"
                onClick={() => setMode('hybrid')}
                className="mt-2 px-3 py-1.5 bg-[#722F37] text-white rounded text-xs font-semibold uppercase"
              >
                Switch to Mode 3: Hybrid
              </button>
            </div>
          ) : (
            <>
              {/* Presets Bar */}
              <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs font-bold uppercase text-[#78716C]">
                  Quick Presets:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyPreset('summer_cotton')}
                    className="px-3 py-1 bg-[#FAF7F2] border border-[#E7E0D5] rounded text-xs font-medium text-[#1C1917] hover:border-[#722F37]"
                  >
                    Summer Cotton Under ₹700
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('muslin_luxury')}
                    className="px-3 py-1 bg-[#FAF7F2] border border-[#E7E0D5] rounded text-xs font-medium text-[#1C1917] hover:border-[#722F37]"
                  >
                    Pure Muslin Ensembles
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('trending_alia')}
                    className="px-3 py-1 bg-[#FAF7F2] border border-[#E7E0D5] rounded text-xs font-medium text-[#1C1917] hover:border-[#722F37]"
                  >
                    Alia & Nayra Cut Hits
                  </button>
                </div>
              </div>

              {/* Rule Groups Container */}
              {ruleGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-2xl border border-[#E7E0D5] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F3ECE2]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                        Condition Match Operator:
                      </span>
                      <select
                        value={group.logical_operator}
                        onChange={(e: any) => {
                          setRuleGroups(prev =>
                            prev.map(g => g.id === group.id ? { ...g, logical_operator: e.target.value } : g)
                          );
                        }}
                        className="text-xs font-bold bg-[#FAF7F2] border border-[#E7E0D5] rounded px-2.5 py-1 text-[#722F37]"
                      >
                        <option value="AND">AND (All rules must match)</option>
                        <option value="OR">OR (Any rule can match)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => addRule(group.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#722F37] hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Rule</span>
                    </button>
                  </div>

                  {/* Rules List */}
                  <div className="space-y-3">
                    {group.rules.map((rule) => (
                      <div
                        key={rule.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[#FAF7F2] p-3 rounded-xl border border-[#E7E0D5]"
                      >
                        {/* Attribute */}
                        <div className="sm:col-span-4">
                          <label className="text-[10px] text-[#78716C] uppercase font-bold block mb-1">
                            Attribute
                          </label>
                          <select
                            value={rule.attribute}
                            onChange={(e: any) => updateRule(group.id, rule.id, { attribute: e.target.value })}
                            className="w-full text-xs py-1.5 px-2.5 rounded bg-white border border-[#E7E0D5]"
                          >
                            <option value="base_wholesale_price">Wholesale Price (₹)</option>
                            <option value="fabric">Fabric Type</option>
                            <option value="style_type">Style Cut / Silhouette</option>
                            <option value="stock_status">Stock Availability</option>
                            <option value="moq">Minimum Order Quantity (MOQ)</option>
                            <option value="category_id">Category</option>
                          </select>
                        </div>

                        {/* Operator */}
                        <div className="sm:col-span-3">
                          <label className="text-[10px] text-[#78716C] uppercase font-bold block mb-1">
                            Condition
                          </label>
                          <select
                            value={rule.operator}
                            onChange={(e: any) => updateRule(group.id, rule.id, { operator: e.target.value })}
                            className="w-full text-xs py-1.5 px-2.5 rounded bg-white border border-[#E7E0D5]"
                          >
                            <option value="equals">Equals</option>
                            <option value="not_equals">Does Not Equal</option>
                            <option value="less_than_or_equal">Less Than or Equal (≤)</option>
                            <option value="greater_than_or_equal">Greater Than or Equal (≥)</option>
                            <option value="contains">Contains Text</option>
                          </select>
                        </div>

                        {/* Value */}
                        <div className="sm:col-span-4">
                          <label className="text-[10px] text-[#78716C] uppercase font-bold block mb-1">
                            Value
                          </label>
                          {rule.attribute === 'stock_status' ? (
                            <select
                              value={rule.value}
                              onChange={(e) => updateRule(group.id, rule.id, { value: e.target.value })}
                              className="w-full text-xs py-1.5 px-2.5 rounded bg-white border border-[#E7E0D5]"
                            >
                              <option value="in_stock">Ready in Stock</option>
                              <option value="low_stock">Low Stock</option>
                              <option value="made_to_order">Made to Order</option>
                            </select>
                          ) : rule.attribute === 'category_id' ? (
                            <select
                              value={rule.value}
                              onChange={(e) => updateRule(group.id, rule.id, { value: e.target.value })}
                              className="w-full text-xs py-1.5 px-2.5 rounded bg-white border border-[#E7E0D5]"
                            >
                              {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={rule.attribute === 'base_wholesale_price' || rule.attribute === 'moq' ? 'number' : 'text'}
                              value={rule.value}
                              onChange={(e) => updateRule(group.id, rule.id, { value: e.target.value })}
                              className="w-full text-xs py-1.5 px-2.5 rounded bg-white border border-[#E7E0D5]"
                            />
                          )}
                        </div>

                        {/* Remove */}
                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => removeRule(group.id, rule.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded"
                            title="Remove condition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Dynamic vs Fixed Membership */}
              <div className="bg-white p-5 rounded-2xl border border-[#E7E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">
                    Catalog Membership Resolution
                  </h4>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Choose whether newly added products matching these rules automatically appear in this customer's lookbook.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-[#FAF7F2] p-1 rounded-lg border border-[#E7E0D5]">
                  <button
                    type="button"
                    onClick={() => setMembershipType('dynamic')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      membershipType === 'dynamic' ? 'bg-[#722F37] text-white' : 'text-[#78716C]'
                    }`}
                  >
                    Dynamic (Auto-Update)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMembershipType('fixed')}
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      membershipType === 'fixed' ? 'bg-[#722F37] text-white' : 'text-[#78716C]'
                    }`}
                  >
                    Fixed Snapshot
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL SELECTION & PRECEDENCE OVERRIDES */}
      {activeTab === 'selection' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Search master products by code (e.g. BF-3PC-101) or title..."
              value={curatedSearch}
              onChange={(e) => setCuratedSearch(e.target.value)}
              className="flex-1 text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
            />

            <select
              value={curatedCategory}
              onChange={(e) => setCuratedCategory(e.target.value)}
              className="text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {products
              .filter(p => {
                if (curatedCategory !== 'all' && p.category_id !== curatedCategory) return false;
                if (curatedSearch.trim()) {
                  const q = curatedSearch.toLowerCase();
                  return p.code.toLowerCase().includes(q) || p.title.toLowerCase().includes(q);
                }
                return true;
              })
              .map((prod) => {
                const override = overrides.get(prod.id);
                const isIncluded = override?.action === 'include';
                const isExcluded = override?.action === 'exclude';
                const isPinned = override?.is_pinned;

                return (
                  <div
                    key={prod.id}
                    className={`bg-white p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isPinned ? 'border-[#C5A059] ring-1 ring-[#C5A059]' :
                      isIncluded ? 'border-[#722F37] bg-[#722F37]/2' :
                      isExcluded ? 'border-red-200 bg-red-50/50 opacity-60' :
                      'border-[#E7E0D5]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0]?.image_url}
                        alt=""
                        className="w-14 h-16 object-cover rounded bg-[#EFE9E0] shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#722F37]">{prod.code}</span>
                          <span className="text-[10px] text-[#78716C]">• {prod.fabric}</span>
                          {isPinned && (
                            <span className="text-[10px] bg-[#C5A059] text-black font-bold px-1.5 py-0.2 rounded flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5" />
                              <span>Pinned Top</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-[#1C1917] mt-0.5">{prod.title}</h4>
                        <div className="text-[11px] text-[#78716C] mt-1">
                          Wholesale: <span className="font-bold text-[#1C1917]">{formatINR(prod.base_wholesale_price)}</span> • MOQ: {prod.moq} pcs
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                      <button
                        type="button"
                        onClick={() => toggleProductInclusion(prod)}
                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                          isIncluded
                            ? 'bg-[#722F37] text-white'
                            : 'bg-[#FAF7F2] border border-[#E7E0D5] text-[#1C1917] hover:bg-[#722F37] hover:text-white'
                        }`}
                      >
                        {isIncluded ? '✓ Included' : '+ Force Include'}
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleProductExclusion(prod)}
                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                          isExcluded
                            ? 'bg-red-700 text-white'
                            : 'bg-[#FAF7F2] border border-[#E7E0D5] text-red-700 hover:bg-red-50'
                        }`}
                      >
                        {isExcluded ? '✕ Excluded' : 'Exclude'}
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePinProduct(prod.id)}
                        className={`p-1.5 rounded border transition-colors ${
                          isPinned
                            ? 'bg-[#C5A059] text-black border-[#C5A059]'
                            : 'bg-white border-[#E7E0D5] text-[#78716C] hover:text-[#1C1917]'
                        }`}
                        title="Pin to top of lookbook"
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER & PRESENTATION CUSTOMIZATION */}
      {activeTab === 'customization' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Customer & Pricing */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4">
            <h3 className="font-serif-luxury text-base font-bold text-[#1C1917] pb-2 border-b border-[#F3ECE2]">
              Customer & Price List Assignment
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Assign to B2B Customer (Optional)
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              >
                <option value="">General Wholesale (Standard Wholesale Pricing)</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.business_name} ({c.contact_person}) — {c.segment} {c.discount_pct ? `(${c.discount_pct}% off)` : ''}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E7E0D5] text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#78716C]">Assigned Price Tier:</span>
                  <span className="font-bold text-[#722F37] uppercase">{selectedCustomer.custom_price_tier || 'Standard'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C]">Discount Override:</span>
                  <span className="font-bold text-emerald-700">{selectedCustomer.discount_pct}% OFF master price</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C]">Customer WhatsApp:</span>
                  <span className="font-mono text-[#1C1917]">{selectedCustomer.phone}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Catalog Expiry Timeline
              </label>
              <select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              >
                <option value={7}>Valid for 7 Days</option>
                <option value={15}>Valid for 15 Days</option>
                <option value={30}>Valid for 30 Days (Standard)</option>
                <option value={60}>Valid for 60 Days</option>
                <option value={0}>No Expiry (Open Link)</option>
              </select>
            </div>
          </div>

          {/* Lookbook Branding & Message */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-xs space-y-4">
            <h3 className="font-serif-luxury text-base font-bold text-[#1C1917] pb-2 border-b border-[#F3ECE2]">
              Lookbook Branding & Content
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Catalog Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Subtitle / Secondary Tagline
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Personalized Customer Greeting
              </label>
              <input
                type="text"
                value={customerGreeting}
                onChange={(e) => setCustomerGreeting(e.target.value)}
                placeholder="e.g. Dear Rajesh ji (Radha Krishna Ethnic Hub),"
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Instructions / Introductory Note
              </label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE PREVIEW & PUBLISH */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#1C1917] uppercase tracking-wider block">
                Previewing: {title}
              </span>
              <span className="text-xs text-[#78716C]">
                {resolvedCatalogProducts.length} wholesale designs resolved
              </span>
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || resolvedCatalogProducts.length === 0}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#5C1D24] disabled:opacity-50"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Catalog...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Publish & Generate Share Link</span>
                </>
              )}
            </button>
          </div>

          {/* Render Mock Public Lookbook */}
          <div className="bg-[#FAF7F2] border border-[#E7E0D5] rounded-2xl p-6 sm:p-10 space-y-8">
            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold">
                Bhavya Fashions Wholesale Lookbook
              </span>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#1C1917]">{title}</h2>
              {subtitle && <p className="text-xs text-[#78716C]">{subtitle}</p>}
              {customerGreeting && (
                <div className="p-3 bg-white rounded-lg border border-[#E7E0D5] text-xs space-y-1">
                  <p className="font-bold text-[#722F37]">{customerGreeting}</p>
                  <p className="text-[#57534E]">{customMessage}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resolvedCatalogProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-[#E7E0D5] overflow-hidden shadow-2xs">
                  <div className="relative aspect-[3/4] bg-[#EFE9E0]">
                    <img src={p.images[0]?.image_url} alt="" className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 bg-black/80 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
                      {p.code}
                    </span>
                    {p.is_pinned && (
                      <span className="absolute top-2 right-2 bg-[#C5A059] text-black font-bold text-[10px] px-1.5 py-0.5 rounded">
                        ★ Pinned
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h4 className="font-serif-luxury text-sm font-bold text-[#1C1917] line-clamp-1">{p.title}</h4>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-bold text-[#722F37]">{formatINR(p.quoted_price)}/pc</span>
                      <span className="text-[10px] bg-[#FAF7F2] border px-2 py-0.5 rounded font-semibold text-[#78716C]">
                        MOQ: {p.moq} pcs
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
