'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Product,
  Category,
  Collection,
  Customer,
  Catalog,
  CatalogMode,
  CatalogOverride,
  CatalogPresentationSettings,
  CatalogProductView,
} from '@/types';
import { formatINR, getProductFallbackImage } from '@/lib/utils';
import { ImageUploadDropzone } from '@/components/ui/ImageUploadDropzone';
import { QuickViewModal } from '@/components/catalog/QuickViewModal';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { FabricMagnifier } from '@/components/ui/FabricMagnifier';
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
  UploadCloud,
  UserPlus,
  X,
  Edit,
  Search,
  Filter,
  ShieldCheck,
  Tag,
  Calendar,
  ExternalLink,
  RefreshCw,
  ZoomIn,
  Maximize2,
  Share2,
} from 'lucide-react';

interface UniversalCatalogBuilderProps {
  products: Product[];
  categories: Category[];
  collections: Collection[];
  customers: Customer[];
  initialCatalog?: Catalog | null;
  existingCatalogs?: Catalog[];
}

export function UniversalCatalogBuilder({
  products,
  categories,
  collections,
  customers,
  initialCatalog,
  existingCatalogs = [],
}: UniversalCatalogBuilderProps) {
  const router = useRouter();
  const isEditing = Boolean(initialCatalog?.id);

  // Local data states
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [localCustomers, setLocalCustomers] = useState<Customer[]>(customers);
  const [catalogsHistory, setCatalogsHistory] = useState<Catalog[]>(existingCatalogs);

  // Selection Method: 'manual' (Tick-Tick) vs 'automated' (Smart Filters)
  const [selectionMethod, setSelectionMethod] = useState<'manual' | 'automated'>(
    initialCatalog?.mode === 'dynamic' ? 'automated' : 'manual'
  );

  // Price Mode: 'request' (Default for B2B) vs 'show'
  const initialPriceMode =
    (initialCatalog?.presentation_settings as any)?.priceDisplayMode ||
    (initialCatalog?.presentation_settings?.showPrices === false ? 'request' : 'request');
  const [priceDisplayMode, setPriceDisplayMode] = useState<'request' | 'show'>(initialPriceMode);

  // Expiry in days: DEFAULT TO 90 DAYS (as per user directive)
  const initialExpiryDays = useMemo(() => {
    if (initialCatalog?.expires_at) {
      const diffDays = Math.ceil(
        (new Date(initialCatalog.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return diffDays > 0 ? diffDays : 90;
    }
    return 90; // Default 90 days
  }, [initialCatalog]);
  const [expiresInDays, setExpiresInDays] = useState<number>(initialExpiryDays);

  // Manual Selection ("Tick-Tick") State: Set of product IDs
  const initialSelectedIds = useMemo(() => {
    if (initialCatalog?.overrides?.length) {
      const ids = new Set<string>();
      initialCatalog.overrides.forEach((o) => {
        if (o.action === 'include') ids.add(o.product_id);
      });
      if (ids.size > 0) return ids;
    }
    // Default to first 12 bestsellers for instant usability if brand new
    return new Set<string>(products.slice(0, 12).map((p) => p.id));
  }, [initialCatalog, products]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(initialSelectedIds);

  // Pinned products
  const initialPinnedIds = useMemo(() => {
    const ids = new Set<string>();
    if (initialCatalog?.overrides) {
      initialCatalog.overrides.forEach((o) => {
        if (o.is_pinned) ids.add(o.product_id);
      });
    }
    return ids;
  }, [initialCatalog]);
  const [pinnedProductIds, setPinnedProductIds] = useState<Set<string>>(initialPinnedIds);

  // Automated Filter State initialized from catalog rules if editing
  const initialFilterFabric = useMemo(() => {
    const r = initialCatalog?.rule_groups?.[0]?.rules?.find((rule: any) => rule.attribute === 'fabric');
    return r?.value || 'all';
  }, [initialCatalog]);
  const [filterFabric, setFilterFabric] = useState<string>(initialFilterFabric);

  const initialFilterCategory = useMemo(() => {
    const r = initialCatalog?.rule_groups?.[0]?.rules?.find((rule: any) => rule.attribute === 'category_id');
    return r?.value || 'all';
  }, [initialCatalog]);
  const [filterCategory, setFilterCategory] = useState<string>(initialFilterCategory);

  const initialFilterPriceMax = useMemo(() => {
    const r = initialCatalog?.rule_groups?.[0]?.rules?.find((rule: any) => rule.attribute === 'base_wholesale_price');
    return r?.value ? Number(r.value) : 0;
  }, [initialCatalog]);
  const [filterPriceMax, setFilterPriceMax] = useState<number>(initialFilterPriceMax);

  const initialFilterReadyStock = useMemo(() => {
    const r = initialCatalog?.rule_groups?.[0]?.rules?.find((rule: any) => rule.attribute === 'stock_status');
    return r ? r.value === 'in_stock' : true;
  }, [initialCatalog]);
  const [filterReadyStock, setFilterReadyStock] = useState<boolean>(initialFilterReadyStock);

  // Manual Selection Search & Category Filter
  const [manualSearch, setManualSearch] = useState('');
  const [manualCategoryFilter, setManualCategoryFilter] = useState('all');

  // Customer & Lookbook Details
  const [title, setTitle] = useState(
    initialCatalog?.title || 'Exclusive Wholesale Kurti Lookbook 2026'
  );
  const [subtitle, setSubtitle] = useState(
    initialCatalog?.subtitle || 'Direct factory supply for boutiques & retail partners'
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCatalog?.customer_id || ''
  );
  const [vipDiscountPct, setVipDiscountPct] = useState<number>(
    (initialCatalog?.presentation_settings as any)?.vipDiscountPct || 0
  );
  const [customerGreeting, setCustomerGreeting] = useState(
    initialCatalog?.customer_greeting || ''
  );
  const [customMessage, setCustomMessage] = useState(
    initialCatalog?.custom_message ||
      'Please review our latest curated designs below and submit your quantity breakdown. Minimum order quantity is 6 pieces per design (standard ratio pack).'
  );
  const [customSlug, setCustomSlug] = useState(initialCatalog?.public_token || '');
  const [accessCode, setAccessCode] = useState(initialCatalog?.access_code || '');
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialCatalog?.cover_image_url || '/images/hero-kesaria-silk.jpg'
  );

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'products' | 'pricing' | 'details' | 'preview' | 'history'>(
    'products'
  );

  // Quick View & Lightbox Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lightboxProduct, setLightboxProduct] = useState<Product | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedToken, setPublishedToken] = useState<string | null>(
    initialCatalog?.public_token || null
  );
  const [publishedAccessCode, setPublishedAccessCode] = useState<string | null>(
    initialCatalog?.access_code || null
  );
  const [copiedLink, setCopiedLink] = useState(false);

  // Modal State for Adding Local Design (<50KB) & New Customer
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCode, setNewProdCode] = useState('');
  const [newProdFabric, setNewProdFabric] = useState('Pure Kesaria Silk');
  const [newProdStyle, setNewProdStyle] = useState('Three-Piece Kurti Pant Dupatta');
  const [newProdPrice, setNewProdPrice] = useState('850');
  const [newProdMoq, setNewProdMoq] = useState('6');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [newCustBusiness, setNewCustBusiness] = useState('');
  const [newCustPerson, setNewCustPerson] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCity, setNewCustCity] = useState('Kolkata');
  const [newCustSegment, setNewCustSegment] = useState('Boutique');
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // Selected Customer reference
  const selectedCustomer = useMemo(() => {
    return localCustomers.find((c) => c.id === selectedCustomerId) || null;
  }, [localCustomers, selectedCustomerId]);

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerGreeting(`Dear ${selectedCustomer.contact_person} (${selectedCustomer.business_name}),`);
      if (selectedCustomer.discount_pct) {
        setVipDiscountPct(selectedCustomer.discount_pct);
      }
    }
  }, [selectedCustomer]);

  // Automated Filter Resolution
  const automatedMatchingProducts = useMemo(() => {
    return localProducts.filter((p) => {
      if (!p.is_active) return false;
      if (filterReadyStock && p.stock_status !== 'in_stock') return false;
      if (filterFabric !== 'all' && !(p.fabric || '').toLowerCase().includes(filterFabric.toLowerCase())) {
        return false;
      }
      if (filterCategory !== 'all' && p.category_id !== filterCategory) {
        return false;
      }
      if (filterPriceMax > 0 && p.base_wholesale_price > filterPriceMax) {
        return false;
      }
      return true;
    });
  }, [localProducts, filterFabric, filterCategory, filterPriceMax, filterReadyStock]);

  // Resolved Products for Lookbook (Manual vs Automated)
  const resolvedCatalogProducts = useMemo(() => {
    let baseList: Product[] = [];

    if (selectionMethod === 'manual') {
      baseList = localProducts.filter((p) => selectedProductIds.has(p.id));
    } else {
      baseList = automatedMatchingProducts;
    }

    const discount = Math.max(0, Math.min(100, vipDiscountPct));

    const views: CatalogProductView[] = baseList.map((prod) => {
      const quoted =
        discount > 0
          ? Math.round(prod.base_wholesale_price * (1 - discount / 100))
          : prod.base_wholesale_price;

      return {
        ...prod,
        price_display_mode: priceDisplayMode,
        quoted_price: quoted,
        is_pinned: pinnedProductIds.has(prod.id),
      };
    });

    // Pinned to the top, then sort by item code
    return views.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return a.code.localeCompare(b.code);
    });
  }, [
    selectionMethod,
    localProducts,
    selectedProductIds,
    automatedMatchingProducts,
    vipDiscountPct,
    priceDisplayMode,
    pinnedProductIds,
  ]);

  // Toggle Single Product Selection ("Tick-Tick")
  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Toggle Pinned
  const handleTogglePin = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Bulk actions for manual selection
  const handleSelectAllFiltered = () => {
    const filtered = localProducts.filter((p) => {
      if (manualCategoryFilter !== 'all' && p.category_id !== manualCategoryFilter) return false;
      if (manualSearch.trim()) {
        const q = manualSearch.toLowerCase();
        return (
          p.code.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          (p.fabric || '').toLowerCase().includes(q)
        );
      }
      return true;
    });

    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      filtered.forEach((p) => next.add(p.id));
      return next;
    });
  };

  const handleDeselectAll = () => {
    setSelectedProductIds(new Set());
  };

  // 1-Click Automated Filter Presets
  const applyFilterPreset = (preset: 'cotton' | 'silk' | 'alia') => {
    if (preset === 'cotton') {
      setFilterFabric('Cotton');
      setFilterPriceMax(700);
      setFilterReadyStock(true);
      setFilterCategory('all');
    } else if (preset === 'silk') {
      setFilterFabric('Silk');
      setFilterPriceMax(0);
      setFilterReadyStock(true);
      setFilterCategory('all');
    } else if (preset === 'alia') {
      setFilterFabric('all');
      setFilterPriceMax(0);
      setFilterReadyStock(true);
      setFilterCategory('all');
    }
  };

  // Save / Publish Catalog
  const handlePublish = async () => {
    if (resolvedCatalogProducts.length === 0) {
      alert('Please select at least 1 design before publishing the catalog.');
      return;
    }

    setIsPublishing(true);

    try {
      const expiresAt =
        expiresInDays > 0
          ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
          : null;

      // Overrides array for manual selection
      const overridesPayload: CatalogOverride[] =
        selectionMethod === 'manual'
          ? Array.from(selectedProductIds).map((id, idx) => ({
              id: `ov-${id}`,
              product_id: id,
              action: 'include',
              display_order: idx,
              is_pinned: pinnedProductIds.has(id),
            }))
          : [];

      // Dynamic rules for automated mode
      const ruleGroupsPayload =
        selectionMethod === 'automated'
          ? [
              {
                id: 'rg-auto',
                logical_operator: 'AND' as const,
                rules: [
                  ...(filterReadyStock
                    ? [{ id: 'r-stock', attribute: 'stock_status', operator: 'equals' as const, value: 'in_stock' }]
                    : []),
                  ...(filterFabric !== 'all'
                    ? [{ id: 'r-fabric', attribute: 'fabric', operator: 'contains' as const, value: filterFabric }]
                    : []),
                  ...(filterCategory !== 'all'
                    ? [{ id: 'r-cat', attribute: 'category_id', operator: 'equals' as const, value: filterCategory }]
                    : []),
                  ...(filterPriceMax > 0
                    ? [{ id: 'r-price', attribute: 'base_wholesale_price', operator: 'less_than_or_equal' as const, value: filterPriceMax }]
                    : []),
                ],
              },
            ]
          : [];

      const payload = {
        id: initialCatalog?.id || undefined,
        title: title.trim() || 'Wholesale Lookbook',
        subtitle: subtitle.trim() || undefined,
        public_token: customSlug.trim() || undefined,
        access_code: accessCode.trim() || undefined,
        mode: (selectionMethod === 'manual' ? 'curated' : 'dynamic') as CatalogMode,
        membership_type: 'dynamic' as const,
        customer_id: selectedCustomerId || undefined,
        customer_greeting: customerGreeting || undefined,
        custom_message: customMessage || undefined,
        expires_at: expiresAt,
        cover_image_url: coverImageUrl || undefined,
        presentation_settings: {
          priceDisplayMode,
          showPrices: priceDisplayMode === 'show',
          showMoq: true,
          showSizes: true,
          showStockStatus: true,
          showDescription: true,
          coverImageUrl: coverImageUrl || undefined,
          vipDiscountPct: vipDiscountPct || 0,
        },
        rule_groups: ruleGroupsPayload,
        overrides: overridesPayload,
      };

      const res = await fetch('/api/catalogs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish lookbook');

      setPublishedToken(data.public_token);
      setPublishedAccessCode(data.access_code || accessCode.trim() || null);
      if (data.catalog) {
        setCatalogsHistory((prev) => [data.catalog, ...prev.filter((c) => c.id !== data.catalog.id)]);
      }
      setActiveTab('preview');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error publishing catalog');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteFromHistory = async (id: string, catTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete custom catalogue "${catTitle}"? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/catalogs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to delete catalog');
      setCatalogsHistory((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Error deleting catalog');
    }
  };

  // Add Product Modal Handler (<50KB compressed)
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle.trim()) return;
    setIsSavingProduct(true);
    try {
      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProdTitle.trim(),
          code: newProdCode.trim() || undefined,
          fabric: newProdFabric,
          style_type: newProdStyle,
          base_wholesale_price: Number(newProdPrice) || 850,
          moq: Number(newProdMoq) || 6,
          image_url: newProdImageUrl || '/images/cat-3piece.jpg',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');

      setLocalProducts((prev) => [data.product, ...prev]);
      setSelectedProductIds((prev) => new Set([data.product.id, ...prev]));

      setAddProductModalOpen(false);
      setNewProdTitle('');
      setNewProdCode('');
      setNewProdImageUrl('');
    } catch (err: any) {
      alert(err.message || 'Error creating product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Add Customer Modal Handler
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustBusiness.trim()) return;
    setIsSavingCustomer(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: newCustBusiness.trim(),
          contact_person: newCustPerson.trim(),
          phone: newCustPhone.trim(),
          city: newCustCity.trim(),
          segment: newCustSegment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create customer');

      setLocalCustomers((prev) => [data.customer, ...prev]);
      setSelectedCustomerId(data.customer.id);
      setAddCustomerModalOpen(false);
      setNewCustBusiness('');
      setNewCustPerson('');
      setNewCustPhone('');
    } catch (err: any) {
      alert(err.message || 'Error creating customer');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleDeleteCurrentCatalog = async () => {
    if (!initialCatalog?.id) return;
    if (!confirm(`Are you sure you want to permanently delete custom catalogue "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch('/api/catalogs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: initialCatalog.id }),
      });
      if (!res.ok) throw new Error('Failed to delete catalog');
      router.push('/admin/catalogs');
    } catch (err: any) {
      alert(err.message || 'Error deleting catalog');
    }
  };

  // Share URL Generator
  const shareableUrl =
    typeof window !== 'undefined' && publishedToken
      ? `${window.location.origin}/catalog/${publishedToken}${
          publishedAccessCode ? `?code=${encodeURIComponent(publishedAccessCode)}` : ''
        }`
      : `/catalog/${publishedToken || 'lookbook-link'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    const token = publishedToken || initialCatalog?.public_token || initialCatalog?.id;
    if (token) {
      fetch('/api/catalogs/track-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catalogId: token, channel: 'copy_link' }),
      }).catch(() => {});
    }
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const whatsappShareUrl = `https://wa.me/${
    selectedCustomer?.phone.replace(/[^0-9]/g, '') || ''
  }?text=${encodeURIComponent(
    `Hello ${selectedCustomer?.contact_person || 'Sir/Madam'}, here is your personalized wholesale kurti catalog from Bhavya Fashions:\n\n${shareableUrl}${
      publishedAccessCode ? `\nSecret Access Code: ${publishedAccessCode}` : ''
    }\n\nPlease tap to review designs and submit your requirement directly on WhatsApp.`
  )}`;

  // Formatted Expiry Date String
  const expiryDateFormatted = useMemo(() => {
    if (expiresInDays <= 0) return 'Never (Permanent Link)';
    const d = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [expiresInDays]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-28 px-3 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D5]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#722F37] font-bold">
              Bhavya Fashions Wholesale
            </span>
            <span className="text-[10px] bg-[#722F37]/10 text-[#722F37] px-2 py-0.5 rounded-full font-semibold">
              Simplified Sales Engine
            </span>
          </div>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
            {isEditing ? `Edit Lookbook: ${title}` : 'Universal Catalog Builder'}
          </h1>
          <p className="text-xs text-[#78716C] mt-0.5">
            Create high-converting, private digital lookbooks in 3 quick steps for boutiques & retail buyers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEditing && (
            <button
              type="button"
              onClick={handleDeleteCurrentCatalog}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition-colors shadow-2xs"
              title="Delete this catalog"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Delete Catalog</span>
            </button>
          )}

          {/* Live Status Badge */}
          <div className="bg-white px-4 py-2 rounded-xl border border-[#E7E0D5] flex items-center gap-3 shadow-2xs">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#78716C] font-semibold block">
              Curated Designs
            </span>
            <span className="font-mono text-base font-extrabold text-[#722F37]">
              {resolvedCatalogProducts.length} Selected
            </span>
          </div>
          <div className="h-8 w-px bg-[#E7E0D5]" />
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-[#78716C] font-semibold block">
              Pricing Mode
            </span>
            <span className="text-xs font-bold text-[#1C1917]">
              {priceDisplayMode === 'request' ? 'Request on Quote' : 'Wholesale Rates'}
            </span>
          </div>
        </div>
        </div>
      </div>

      {/* Published Success Banner */}
      {publishedToken && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ✓
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-emerald-950">
                {isEditing ? 'Catalog Successfully Updated & Saved!' : 'Catalog Successfully Generated & Ready to Share!'}
              </h3>
              <p className="text-xs text-emerald-800">
                Public lookbook token: <span className="font-mono font-bold">{publishedToken}</span> ({resolvedCatalogProducts.length} designs included • Valid until {expiryDateFormatted})
              </p>
              {publishedAccessCode && (
                <div className="inline-flex items-center gap-2 mt-1.5 px-3 py-0.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono text-emerald-900">
                  <span className="font-sans text-[11px] font-semibold text-zinc-500 uppercase">Passcode:</span>
                  <span className="font-bold text-[#722F37]">{publishedAccessCode}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 flex-wrap">
            <div className="flex-1 bg-white border border-emerald-200 px-3.5 py-2 rounded-lg font-mono text-xs text-[#1C1917] truncate min-w-[200px]">
              {shareableUrl}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24] transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Share Link'}</span>
            </button>

            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#20ba59] transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </a>

            <Link
              href={shareableUrl}
              target="_blank"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-white border border-[#E7E0D5] text-[#1C1917] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              <span>Open Lookbook</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/admin/catalogs"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-lg bg-[#FAF7F2] border border-[#E7E0D5] text-[#722F37] text-xs font-bold uppercase tracking-wider hover:bg-[#EFE9E0] transition-colors cursor-pointer"
            >
              <span>All Catalogs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Step Navigation Tabs */}
      <div className="flex items-center border-b border-[#E7E0D5] gap-3 sm:gap-6 overflow-x-auto pb-1 text-xs font-bold uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'border-[#722F37] text-[#722F37]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>1. Product Selection ({resolvedCatalogProducts.length} Active)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pricing')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'pricing'
              ? 'border-[#722F37] text-[#722F37]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>2. Price & Expiry (90 Days Default)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'details'
              ? 'border-[#722F37] text-[#722F37]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>3. Boutique & Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'preview'
              ? 'border-[#722F37] text-[#722F37]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>4. Live Lookbook & Share</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'border-[#722F37] text-[#722F37]'
              : 'border-transparent text-[#78716C] hover:text-[#1C1917]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Link History ({catalogsHistory.length})</span>
        </button>
      </div>

      {/* =========================================================================
          STEP 1: PRODUCT SELECTION (MANUAL TICK-TICK vs AUTOMATED SMART FILTER)
      ========================================================================== */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Method Selector: Manual Tick-Tick vs Automated */}
          <div className="bg-white p-4 rounded-2xl border border-[#E7E0D5] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                How would you like to select products?
              </span>
              <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                Choose Selection Mode
              </h3>
            </div>

            <div className="inline-flex p-1 bg-[#FAF7F2] rounded-xl border border-[#E7E0D5]">
              <button
                type="button"
                onClick={() => setSelectionMethod('manual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectionMethod === 'manual'
                    ? 'bg-[#722F37] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Manual Selection (Tick-Tick)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectionMethod('automated')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectionMethod === 'automated'
                    ? 'bg-[#722F37] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Automated Smart Filters</span>
              </button>
            </div>
          </div>

          {/* ---------------- SUB-MODE A: MANUAL SELECTION ("TICK-TICK") ---------------- */}
          {selectionMethod === 'manual' && (
            <div className="space-y-5">
              {/* Search & Category Filter Bar */}
              <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#78716C] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by code (e.g. DN11059) or title or fabric..."
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    className="w-full text-xs py-2 pl-9 pr-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <select
                  value={manualCategoryFilter}
                  onChange={(e) => setManualCategoryFilter(e.target.value)}
                  className="text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                >
                  <option value="all">All Categories & Styles</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status & Quick Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E7E0D5]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-zinc-600">Selected:</span>
                  <span className="font-mono font-bold text-sm text-[#722F37] bg-white px-2.5 py-0.5 rounded-md border border-[#E7E0D5]">
                    {selectedProductIds.size} of {localProducts.length} Designs
                  </span>
                  <span className="text-[11px] text-[#78716C] hidden md:inline">
                    • Tap any card to tick/untick • Tap image to Quick View & Fabric Zoom
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSelectAllFiltered}
                    className="px-3 py-1.5 rounded-lg bg-[#722F37] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#5C1D24] transition-colors cursor-pointer"
                  >
                    Select All Filtered
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E7E0D5] text-[#1C1917] text-[11px] font-semibold hover:bg-zinc-100 transition-colors cursor-pointer"
                  >
                    Deselect All
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddProductModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#C5A059] text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#b08e48] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Upload Design (&lt;50KB)</span>
                  </button>
                </div>
              </div>

              {/* Manual "Tick-Tick" Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {localProducts
                  .filter((p) => {
                    if (manualCategoryFilter !== 'all' && p.category_id !== manualCategoryFilter) {
                      return false;
                    }
                    if (manualSearch.trim()) {
                      const q = manualSearch.toLowerCase();
                      return (
                        p.code.toLowerCase().includes(q) ||
                        p.title.toLowerCase().includes(q) ||
                        (p.fabric || '').toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((prod) => {
                    const isSelected = selectedProductIds.has(prod.id);
                    const isPinned = pinnedProductIds.has(prod.id);
                    const thumbImg =
                      (prod.images[0] as any)?.local_url ||
                      prod.images[0]?.image_url ||
                      getProductFallbackImage(prod.style_type);

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`group relative rounded-xl border p-3 flex gap-3 transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-[#722F37]/5 border-[#722F37] ring-1 ring-[#722F37]/50 shadow-xs'
                            : 'bg-white border-[#E7E0D5] hover:border-[#722F37]/40 hover:bg-[#FAF7F2]/50'
                        }`}
                      >
                        {/* Thumbnail with Quick View Trigger */}
                        <div
                          className="relative w-20 h-24 rounded-lg overflow-hidden bg-[#EFE9E0] shrink-0 border border-[#E7E0D5] group/img"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewProduct(prod);
                          }}
                          title="Click to open Quick View & deep fabric zoom"
                        >
                          <img
                            src={thumbImg}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallback = getProductFallbackImage(prod.style_type);
                              if (target.src !== fallback) target.src = fallback;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold uppercase">
                            <Eye className="w-3.5 h-3.5 text-[#C5A059]" />
                          </div>
                          <span className="absolute bottom-1 left-1 bg-black/80 text-white font-mono text-[9px] px-1 py-0.2 rounded">
                            {prod.code}
                          </span>
                        </div>

                        {/* Product Info & Checkbox */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-[10px] font-bold text-[#722F37] uppercase tracking-wide truncate">
                                {prod.fabric || 'Pure Fabric'}
                              </span>

                              {/* Big "Tick-Tick" Checkbox */}
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${
                                  isSelected
                                    ? 'bg-[#722F37] text-white'
                                    : 'border border-zinc-400 bg-white group-hover:border-[#722F37]'
                                }`}
                              >
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                ) : (
                                  <span className="text-[9px] text-transparent">.</span>
                                )}
                              </div>
                            </div>

                            <h4 className="text-xs font-bold text-[#1C1917] mt-0.5 line-clamp-1">
                              {prod.title}
                            </h4>

                            <div className="text-[11px] text-[#78716C] mt-1">
                              {priceDisplayMode === 'request' ? (
                                <span className="text-[10px] font-semibold text-[#722F37] bg-[#722F37]/10 px-1.5 py-0.5 rounded">
                                  Quote on Request
                                </span>
                              ) : (
                                <span>Wholesale: <strong className="text-[#1C1917]">{formatINR(prod.base_wholesale_price)}</strong></span>
                              )}
                              <span className="ml-1.5 text-[10px]">• MOQ: {prod.moq} pcs</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-[#F3ECE2] text-[10px]">
                            <span
                              className={`font-semibold ${
                                isSelected ? 'text-[#722F37]' : 'text-zinc-400'
                              }`}
                            >
                              {isSelected ? '✓ In Lookbook' : 'Click to select'}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => handleTogglePin(prod.id, e)}
                              className={`p-1 rounded transition-colors ${
                                isPinned
                                  ? 'bg-[#C5A059] text-black font-bold'
                                  : 'text-zinc-400 hover:text-zinc-700'
                              }`}
                              title={isPinned ? 'Pinned at top' : 'Pin to top of lookbook'}
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ---------------- SUB-MODE B: AUTOMATED SMART FILTERS ---------------- */}
          {selectionMethod === 'automated' && (
            <div className="space-y-6">
              {/* 1-Click Quick Presets */}
              <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex items-center justify-between gap-3 flex-wrap shadow-2xs">
                <span className="text-xs font-bold uppercase text-[#78716C] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>1-Click Presets:</span>
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyFilterPreset('cotton')}
                    className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E7E0D5] rounded-lg text-xs font-medium text-[#1C1917] hover:border-[#722F37] hover:bg-white transition-colors cursor-pointer"
                  >
                    ☀️ Summer Cotton (Under ₹700)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFilterPreset('silk')}
                    className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E7E0D5] rounded-lg text-xs font-medium text-[#1C1917] hover:border-[#722F37] hover:bg-white transition-colors cursor-pointer"
                  >
                    👑 Luxury Kesaria & Muslin Sets
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFilterPreset('alia')}
                    className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E7E0D5] rounded-lg text-xs font-medium text-[#1C1917] hover:border-[#722F37] hover:bg-white transition-colors cursor-pointer"
                  >
                    ✨ Festive Alia Cut Hits
                  </button>
                </div>
              </div>

              {/* Friendly Filters Grid */}
              <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-2xs space-y-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] pb-2 border-b border-[#F3ECE2]">
                  Smart Filter Rules
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Fabric */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Fabric Material
                    </label>
                    <select
                      value={filterFabric}
                      onChange={(e) => setFilterFabric(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                    >
                      <option value="all">All Fabrics</option>
                      <option value="Silk">Pure Kesaria Silk</option>
                      <option value="Cotton">Cambric 60-60 Cotton</option>
                      <option value="Modal">Modal Satin</option>
                      <option value="Chanderi">Royal Chanderi</option>
                      <option value="Muslin">Handcrafted Muslin</option>
                      <option value="Rayon">Heavy Viscose Rayon</option>
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Style / Category
                    </label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Max Price Ceiling */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Wholesale Price Ceiling
                    </label>
                    <select
                      value={filterPriceMax}
                      onChange={(e) => setFilterPriceMax(Number(e.target.value))}
                      className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                    >
                      <option value={0}>No Limit (All Prices)</option>
                      <option value={699}>Under ₹699/pc (Volume Bestsellers)</option>
                      <option value={899}>Under ₹899/pc (Mid-Premium)</option>
                      <option value={1199}>Under ₹1,199/pc (Luxury Ensembles)</option>
                      <option value={1500}>Under ₹1,500/pc (Heavy Zari Bridal)</option>
                    </select>
                  </div>

                  {/* Ready Stock */}
                  <div>
                    <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                      Stock Availability
                    </label>
                    <select
                      value={filterReadyStock ? 'ready' : 'all'}
                      onChange={(e) => setFilterReadyStock(e.target.value === 'ready')}
                      className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                    >
                      <option value="ready">Ready Stock in Hubs (Surat/Barabazar)</option>
                      <option value="all">Include Made-to-Order & Advance Booking</option>
                    </select>
                  </div>
                </div>

                {/* Match Result Counter */}
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-semibold">
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>
                      Matching <strong className="font-mono text-sm">{automatedMatchingProducts.length}</strong> designs automatically with these rules.
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700">
                    Auto-updates dynamically as new inventory arrives
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          STEP 2: PRICING & VALIDITY ("ONE WITH PRICE" + 90 DAYS DEFAULT EXPIRY)
      ========================================================================== */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* PRICING MODE CARD ("ONE WITH PRICE") */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-2xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                Wholesale Price Display
              </span>
              <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                How should prices appear in this lookbook?
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                Protect your trade margins or share transparent wholesale prices with verified boutique partners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Option 1: Request on Quote (Default for B2B) */}
              <div
                onClick={() => setPriceDisplayMode('request')}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  priceDisplayMode === 'request'
                    ? 'border-[#722F37] bg-[#722F37]/5 shadow-sm'
                    : 'border-[#E7E0D5] bg-white hover:border-[#722F37]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#722F37]/10 text-[#722F37] flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4 text-[#C5A059]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1C1917]">Request on Quote</h4>
                      <span className="text-[10px] bg-[#722F37] text-white px-2 py-0.2 rounded font-bold uppercase">
                        Default for Wholesale
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      priceDisplayMode === 'request'
                        ? 'border-[#722F37] bg-[#722F37]'
                        : 'border-zinc-300'
                    }`}
                  >
                    {priceDisplayMode === 'request' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <p className="text-xs text-[#57534E] mt-3 leading-relaxed">
                  Prices are confidential. Boutique buyers see <strong>"Price: Request on Quote"</strong> with an instant WhatsApp quotation button. Protects counter profit margins (80%–140%).
                </p>
              </div>

              {/* Option 2: Show Direct Wholesale Prices */}
              <div
                onClick={() => setPriceDisplayMode('show')}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  priceDisplayMode === 'show'
                    ? 'border-[#722F37] bg-[#722F37]/5 shadow-sm'
                    : 'border-[#E7E0D5] bg-white hover:border-[#722F37]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1C1917]">Show Wholesale Prices</h4>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        e.g. ₹599 / pc, ₹850 / pc
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      priceDisplayMode === 'show'
                        ? 'border-[#722F37] bg-[#722F37]'
                        : 'border-zinc-300'
                    }`}
                  >
                    {priceDisplayMode === 'show' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <p className="text-xs text-[#57534E] mt-3 leading-relaxed">
                  Direct factory trade prices are visible to the buyer on every product card. Suitable for verified regular accounts and seasonal price sheets.
                </p>
              </div>
            </div>

            {/* VIP Discount Option if Show Prices is Active */}
            {priceDisplayMode === 'show' && (
              <div className="mt-4 p-4 bg-[#FAF7F2] rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                <div>
                  <label className="text-xs font-bold text-[#1C1917] block">
                    VIP Boutique Special Discount (%)
                  </label>
                  <span className="text-[11px] text-[#78716C]">
                    Applies direct percentage off master wholesale price (e.g. 5% or 10% off for volume partners).
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={vipDiscountPct}
                    onChange={(e) => setVipDiscountPct(Number(e.target.value))}
                    className="w-20 text-xs py-1.5 px-3 rounded-lg border border-[#E7E0D5] bg-white font-mono font-bold text-[#722F37] text-center"
                  />
                  <span className="text-xs font-bold text-[#1C1917]">% OFF</span>
                </div>
              </div>
            )}
          </div>

          {/* CATALOGUE EXPIRY CARD (SET TO 90 DAYS BY DEFAULT) */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-2xs space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                Lookbook Validity & Expiry
              </span>
              <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                Catalog Expiry Timeline (90 Days Default)
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                Wholesale seasonal quotes remain valid for this period. After expiry, buyers are prompted to contact your sales team for updated pricing.
              </p>
            </div>

            {/* Quick Pill Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
              {[
                { days: 90, label: '90 Days', badge: 'Default / Seasonal' },
                { days: 30, label: '30 Days', badge: 'Flash Offer' },
                { days: 60, label: '60 Days', badge: '2 Months' },
                { days: 180, label: '180 Days', badge: 'Half Year' },
                { days: 0, label: 'No Expiry', badge: 'Permanent' },
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setExpiresInDays(opt.days)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    expiresInDays === opt.days
                      ? 'border-[#722F37] bg-[#722F37] text-white shadow-xs'
                      : 'border-[#E7E0D5] bg-[#FAF7F2] text-[#1C1917] hover:border-[#722F37]/50 hover:bg-white'
                  }`}
                >
                  <span className="text-sm font-bold block">{opt.label}</span>
                  <span
                    className={`text-[10px] block mt-0.5 ${
                      expiresInDays === opt.days ? 'text-white/80' : 'text-[#78716C]'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Expiry Banner Preview */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-xs text-amber-900">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <div>
                <strong>Active Validity Window:</strong> This catalog link will expire on{' '}
                <strong className="underline">{expiryDateFormatted}</strong> ({expiresInDays > 0 ? `${expiresInDays} days from today` : 'Unlimited'}).
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 3: BOUTIQUE & LOOKBOOK DETAILS
      ========================================================================== */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer / Boutique Assignment */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-2xs space-y-4">
            <h3 className="font-serif-luxury text-base font-bold text-[#1C1917] pb-2 border-b border-[#F3ECE2]">
              Boutique / Buyer Assignment
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#1C1917]">
                  Target Boutique (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setAddCustomerModalOpen(true)}
                  className="text-[11px] font-bold text-[#722F37] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Add New Boutique</span>
                </button>
              </div>

              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
              >
                <option value="">General Wholesale (Open to all boutiques)</option>
                {localCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name} ({c.contact_person}) — {c.city}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E7E0D5] text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#78716C]">Store:</span>
                  <span className="font-bold text-[#1C1917]">{selectedCustomer.business_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C]">Contact Person:</span>
                  <span className="font-semibold text-[#1C1917]">{selectedCustomer.contact_person}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716C]">WhatsApp:</span>
                  <span className="font-mono text-[#722F37] font-bold">{selectedCustomer.phone}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Personalized Customer Greeting
              </label>
              <input
                type="text"
                value={customerGreeting}
                onChange={(e) => setCustomerGreeting(e.target.value)}
                placeholder="e.g. Dear Rajesh ji (Radha Krishna Boutique),"
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Custom Instructions Note
              </label>
              <textarea
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
              />
            </div>
          </div>

          {/* Lookbook Branding & Security */}
          <div className="bg-white p-6 rounded-2xl border border-[#E7E0D5] shadow-2xs space-y-4">
            <h3 className="font-serif-luxury text-base font-bold text-[#1C1917] pb-2 border-b border-[#F3ECE2]">
              Lookbook Branding & Link Protection
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Lookbook Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
              />
            </div>

            <div>
              <ImageUploadDropzone
                label="Cover Banner (Auto-compressed < 50KB in High-Res)"
                currentImageUrl={coverImageUrl}
                onUploadComplete={(url) => setCoverImageUrl(url)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Custom Slug (Optional)
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="e.g. festive-lookbook-2026"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Secret Passcode (Optional)
                </label>
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase().trim())}
                  placeholder="e.g. BF-VIP-2026"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono uppercase focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 4: LIVE LOOKBOOK PREVIEW & SHARE
      ========================================================================== */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-[#E7E0D5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-[#722F37] uppercase tracking-wider block">
                Live Interactive Lookbook Preview
              </span>
              <h3 className="font-serif-luxury text-base font-bold text-[#1C1917]">
                {title} ({resolvedCatalogProducts.length} Designs)
              </h3>
              <p className="text-[11px] text-[#78716C]">
                Click any product to test Quick View • Desktop users can deeply hover for the 2.6× fabric magnifying glass.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || resolvedCatalogProducts.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#5C1D24] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Generate & Share Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Render Mock Public Lookbook */}
          <div className="bg-[#FAF7F2] border border-[#E7E0D5] rounded-3xl p-5 sm:p-10 space-y-8 shadow-sm">
            {/* Header Area */}
            <div className="max-w-2xl space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#722F37] font-bold">
                Bhavya Fashions Wholesale Lookbook
              </span>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#1C1917]">{title}</h2>
              {subtitle && <p className="text-xs text-[#78716C] leading-relaxed">{subtitle}</p>}
              {customerGreeting && (
                <div className="p-3.5 bg-white rounded-xl border border-[#E7E0D5] text-xs space-y-1 shadow-2xs">
                  <p className="font-bold text-[#722F37]">{customerGreeting}</p>
                  <p className="text-[#57534E] leading-relaxed">{customMessage}</p>
                </div>
              )}
            </div>

            {/* Cover Banner */}
            {coverImageUrl && (
              <div className="w-full h-44 sm:h-64 rounded-2xl overflow-hidden border border-[#E7E0D5] relative shadow-sm">
                <img src={coverImageUrl} alt="Catalog Cover" className="w-full h-full object-cover" />
              </div>
            )}

            {/* Products Grid with Click-to-QuickView */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resolvedCatalogProducts.map((p) => {
                const thumbImg =
                  (p.images[0] as any)?.local_url ||
                  p.images[0]?.image_url ||
                  getProductFallbackImage(p.style_type);

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-[#E7E0D5] overflow-hidden shadow-2xs hover:shadow-md transition-shadow group flex flex-col"
                  >
                    <div
                      className="relative aspect-[3/4] bg-[#EFE9E0] overflow-hidden cursor-pointer"
                      onClick={() => setQuickViewProduct(p)}
                    >
                      <img
                        src={thumbImg}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback = getProductFallbackImage(p.style_type);
                          if (target.src !== fallback) target.src = fallback;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 uppercase tracking-wider">
                        <Eye className="w-4 h-4 text-[#C5A059]" />
                        <span>Quick View & Fabric Zoom</span>
                      </div>
                      <span className="absolute top-2 left-2 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded">
                        {p.code}
                      </span>
                      {p.is_pinned && (
                        <span className="absolute top-2 right-2 bg-[#C5A059] text-black font-bold text-[10px] px-2 py-0.5 rounded">
                          ★ Pinned
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] block">
                          {p.fabric}
                        </span>
                        <h4 className="font-serif-luxury text-sm font-bold text-[#1C1917] line-clamp-1 mt-0.5">
                          {p.title}
                        </h4>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-[#F3ECE2]">
                        {priceDisplayMode === 'show' ? (
                          <span className="text-base font-extrabold text-[#722F37]">
                            {formatINR(p.quoted_price)}/pc
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#722F37] bg-[#722F37]/10 px-2 py-0.5 rounded-full">
                            <Sparkles className="w-3 h-3 text-[#C5A059]" />
                            <span>Request on Quote</span>
                          </span>
                        )}
                        <span className="text-[10px] bg-[#FAF7F2] border px-2 py-0.5 rounded font-semibold text-[#78716C]">
                          MOQ: {p.moq} pcs
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 5: CATALOG LINK HISTORY & ANALYTICS
      ========================================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-[#E7E0D5] shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                Issued Catalog Links History
              </h3>
              <p className="text-xs text-[#78716C]">
                Track all catalogs created, active validity dates, and direct links.
              </p>
            </div>
            <span className="font-mono text-xs font-bold bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#E7E0D5] text-[#722F37]">
              {catalogsHistory.length} Total Catalogs
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-[#E7E0D5] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] border-b border-[#E7E0D5] text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
                  <tr>
                    <th className="py-3 px-4">Title / Token</th>
                    <th className="py-3 px-4">Pricing</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0D5]">
                  {catalogsHistory.map((cat) => {
                    const isExpired =
                      cat.expires_at && new Date(cat.expires_at).getTime() < Date.now();
                    const catUrl = `/catalog/${cat.public_token}`;

                    return (
                      <tr key={cat.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#1C1917]">{cat.title}</div>
                          <div className="font-mono text-[10px] text-[#722F37]">{cat.public_token}</div>
                        </td>
                        <td className="py-3 px-4">
                          {(cat.presentation_settings as any)?.priceDisplayMode === 'show' ? (
                            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                              Wholesale Rates
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-[#722F37] bg-[#722F37]/10 px-2 py-0.5 rounded">
                              Request on Quote
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-[#78716C]">
                          {cat.expires_at ? (
                            <span>{new Date(cat.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          ) : (
                            <span>No Expiry</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {isExpired ? (
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                              Expired
                            </span>
                          ) : (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={catUrl}
                              target="_blank"
                              className="p-1.5 rounded-lg border border-[#E7E0D5] text-[#1C1917] hover:bg-zinc-100 transition-colors"
                              title="Open Catalog Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                const full = `${window.location.origin}${catUrl}`;
                                navigator.clipboard.writeText(full);
                                alert(`Copied share link: ${full}`);
                              }}
                              className="p-1.5 rounded-lg border border-[#E7E0D5] text-[#1C1917] hover:bg-zinc-100 transition-colors"
                              title="Copy Share Link"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/admin/catalogs/create?id=${cat.id}`}
                              className="p-1.5 rounded-lg bg-[#722F37] text-white hover:bg-[#5C1D24] transition-colors"
                              title="Edit this Catalog"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteFromHistory(cat.id, cat.title)}
                              className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete this Catalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E0D5] px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-[#1C1917]">
              {resolvedCatalogProducts.length} Designs Selected
            </span>
            <span className="text-zinc-300 hidden sm:inline">|</span>
            <span className="text-[#78716C] hidden sm:inline">
              Price: <strong className="text-[#722F37]">{priceDisplayMode === 'request' ? 'Request on Quote' : 'Wholesale'}</strong>
            </span>
            <span className="text-zinc-300 hidden sm:inline">|</span>
            <span className="text-[#78716C] hidden sm:inline">
              Expiry: <strong className="text-amber-800">{expiryDateFormatted}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'preview' && (
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className="px-4 py-2 rounded-lg bg-white border border-[#E7E0D5] text-[#1C1917] text-xs font-bold uppercase tracking-wider hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Preview Lookbook
              </button>
            )}

            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || resolvedCatalogProducts.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5C1D24] shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Save Lookbook' : 'Generate & Share Link'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* QUICK VIEW MODAL WITH DEEP FABRIC MAGNIFYING GLASS */}
      {quickViewProduct && (
        <QuickViewModal
          product={{
            ...quickViewProduct,
            quoted_price: quickViewProduct.base_wholesale_price,
            price_display_mode: priceDisplayMode,
          }}
          selectedState={undefined}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
          onSaveSelection={() => {}}
          onOpenLightbox={(p) => {
            setLightboxProduct(p);
            setLightboxIndex(0);
          }}
        />
      )}

      {/* LIGHTBOX FOR FULLSCREEN ENLARGEMENT */}
      {lightboxProduct && (
        <ImageLightbox
          images={lightboxProduct.images}
          currentIndex={lightboxIndex}
          isOpen={Boolean(lightboxProduct)}
          onClose={() => setLightboxProduct(null)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}

      {/* MODAL 1: UPLOAD DESIGN FROM LOCAL FILE (<50KB) */}
      {addProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#E7E0D5] shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#F3ECE2] pb-3">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                  Upload Design from Local File
                </h3>
                <p className="text-xs text-[#78716C]">
                  Select product image from PC. High resolution, compressed strictly &lt; 50KB.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddProductModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <ImageUploadDropzone
                label="Product Photograph (Auto-compressed < 50KB in High-Res)"
                currentImageUrl={newProdImageUrl}
                onUploadComplete={(url) => setNewProdImageUrl(url)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Design Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdTitle}
                    onChange={(e) => setNewProdTitle(e.target.value)}
                    placeholder="e.g. Kesaria Zari Work Anarkali Set"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Item Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdCode}
                    onChange={(e) => setNewProdCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BF-KZ-909"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Fabric
                  </label>
                  <input
                    type="text"
                    value={newProdFabric}
                    onChange={(e) => setNewProdFabric(e.target.value)}
                    placeholder="e.g. Pure Kesaria Silk"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Style / Silhouette
                  </label>
                  <input
                    type="text"
                    value={newProdStyle}
                    onChange={(e) => setNewProdStyle(e.target.value)}
                    placeholder="e.g. 3-Piece Kurti Pant Dupatta"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Wholesale Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    MOQ (Ratio Pack Pcs)
                  </label>
                  <input
                    type="number"
                    value={newProdMoq}
                    onChange={(e) => setNewProdMoq(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3ECE2]">
                <button
                  type="button"
                  onClick={() => setAddProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E7E0D5] text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct || !newProdTitle.trim()}
                  className="px-5 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#58111A] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingProduct ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Save & Add to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW WHOLESALE CUSTOMER */}
      {addCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E7E0D5] shadow-2xl p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#F3ECE2] pb-3">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-[#1C1917]">
                  Create Wholesale Customer
                </h3>
                <p className="text-xs text-[#78716C]">
                  Register a buyer or boutique to assign personalized lookbooks & pricing.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddCustomerModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Business / Store Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustBusiness}
                  onChange={(e) => setNewCustBusiness(e.target.value)}
                  placeholder="e.g. Radha Krishna Ethnic Boutique"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={newCustPerson}
                  onChange={(e) => setNewCustPerson(e.target.value)}
                  placeholder="e.g. Rajesh Agarwal"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. +91 98300 12345"
                  className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] font-mono focus:bg-white focus:outline-none focus:border-[#722F37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    City / Market
                  </label>
                  <input
                    type="text"
                    value={newCustCity}
                    onChange={(e) => setNewCustCity(e.target.value)}
                    placeholder="e.g. Kolkata"
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                    Buyer Segment
                  </label>
                  <select
                    value={newCustSegment}
                    onChange={(e) => setNewCustSegment(e.target.value)}
                    className="w-full text-xs py-2 px-3 rounded-lg border border-[#E7E0D5] bg-[#FAF7F2] focus:bg-white focus:outline-none focus:border-[#722F37]"
                  >
                    <option value="Boutique">Boutique</option>
                    <option value="Retail Chain">Retail Chain</option>
                    <option value="Wholesaler">Wholesaler</option>
                    <option value="Reseller">Reseller</option>
                    <option value="Exporter">Exporter</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F3ECE2]">
                <button
                  type="button"
                  onClick={() => setAddCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E7E0D5] text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer || !newCustBusiness.trim()}
                  className="px-5 py-2 rounded-lg bg-[#722F37] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#58111A] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isSavingCustomer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Save & Select</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
