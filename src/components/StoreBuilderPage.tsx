import React, { useEffect, useMemo, useState } from 'react';
import {
  Bot,
  FileText,
  Globe,
  Image as ImageIcon,
  ImagePlus,
  LayoutTemplate,
  LoaderCircle,
  Monitor,
  Palette,
  Settings,
  Smartphone,
  Sparkles,
  Type
} from 'lucide-react';
import type { SessionUser } from '../App';
import { supabase } from '../contexts/supabaseClient';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { ensureStoreForUser, formatCurrency, type StoreRecord } from '../lib/store';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';

type BuilderPageType = 'home' | 'shop' | 'about' | 'contact';
type PreviewMode = 'desktop' | 'mobile';

type JsonTextMap = Record<string, string>;

type StoreThemeRow = {
  id: string;
  template_code: string;
  font: string | null;
  primary_color: string | null;
  accent_color: string | null;
  tagline: string | null;
  settings: JsonTextMap;
};

type StorePageRow = {
  id: string;
  page_type: BuilderPageType;
  title: string;
  slug: string;
  description: string | null;
  content: JsonTextMap;
  show_in_nav: boolean;
  sort_order: number;
};

type ProductRow = {
  id: string;
  name: string;
  price: number;
  description: string | null;
  product_images?: Array<{ id?: string; public_url: string | null }>;
};

type StoreAssetRow = {
  id: string;
  asset_type: string;
  public_url: string | null;
  storage_path: string;
  sort_order: number;
};

type TemplateOption = {
  code: string;
  name: string;
  font: string;
  primary: string;
  accent: string;
  mood: string;
  inspiration: string;
  note: string;
};

interface StoreBuilderPageProps {
  navigate?: (page: any) => void;
  currentUser: SessionUser;
}

const templateOptions: TemplateOption[] = [
  {
    code: 'market-fresh',
    name: 'Market Fresh',
    font: 'Plus Jakarta Sans',
    primary: '#b45309',
    accent: '#14532d',
    mood: 'Warm local market',
    inspiration: 'Original FEZZY builder',
    note: 'Built for food, beauty, lifestyle, and neighborhood-first commerce.'
  },
  {
    code: 'atelier-luxe',
    name: 'Atelier Luxe',
    font: 'Playfair Display',
    primary: '#7c2d12',
    accent: '#1f2937',
    mood: 'Editorial boutique',
    inspiration: 'Inspired by fashion-forward WordPress boutique themes',
    note: 'Best for jewelry, fashion, beauty, and premium gifting brands.'
  },
  {
    code: 'tech-minimal',
    name: 'Tech Minimal',
    font: 'Montserrat',
    primary: '#0f172a',
    accent: '#2563eb',
    mood: 'Clean modern catalog',
    inspiration: 'Inspired by electronics and minimalist store layouts',
    note: 'Great for gadgets, electronics, digital accessories, and smart products.'
  },
  {
    code: 'shoplaza-block',
    name: 'Shoplaza Block',
    font: 'DM Sans',
    primary: '#111827',
    accent: '#f59e0b',
    mood: 'Classy block storefront',
    inspiration: 'Inspired by WordPress.org Shoplaza',
    note: 'Pairs crisp modular sections with elegant spacing and premium merchandising.'
  },
  {
    code: 'signify-commerce',
    name: 'Signify Commerce',
    font: 'Cormorant Garamond',
    primary: '#312e81',
    accent: '#f97316',
    mood: 'Statement-led showcase',
    inspiration: 'Inspired by WordPress.org Signify eCommerce',
    note: 'Designed for visual storytelling, richer hero moments, and curated collections.'
  },
  {
    code: 'electronics-grid',
    name: 'Electronics Grid',
    font: 'Space Grotesk',
    primary: '#0f172a',
    accent: '#06b6d4',
    mood: 'Sharper digital retail',
    inspiration: 'Inspired by WordPress.org Electronics Store eCommerce',
    note: 'Works well for fast-moving SKUs, launch banners, and feature-heavy products.'
  },
  {
    code: 'fashion-runway',
    name: 'Fashion Runway',
    font: 'Bricolage Grotesque',
    primary: '#831843',
    accent: '#fb7185',
    mood: 'Bold fashion editorial',
    inspiration: 'Inspired by WordPress.org LZ Fashion Ecommerce',
    note: 'Best for apparel, accessories, cosmetics, and high-identity lifestyle brands.'
  }
];

export function StoreBuilderPage({ navigate, currentUser }: StoreBuilderPageProps) {
  const [store, setStore] = useState<StoreRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'identity' | 'theme' | 'pages' | 'media' | 'ai'>('identity');
  const [theme, setTheme] = useState<StoreThemeRow | null>(null);
  const [pages, setPages] = useState<StorePageRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [assets, setAssets] = useState<StoreAssetRow[]>([]);
  const [activePage, setActivePage] = useState<BuilderPageType>('home');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [aiBrief, setAiBrief] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        const currentStore = await ensureStoreForUser(currentUser);
        setStore(currentStore);

        if (!currentStore) {
          setTheme(null);
          setPages([]);
          setProducts([]);
          setAssets([]);
          return;
        }

        const [themeResult, pagesResult, productsResult, assetsResult] = await Promise.all([
          supabase.from('store_themes').select('*').eq('store_id', currentStore.id).maybeSingle(),
          supabase
            .from('store_pages')
            .select('*')
            .eq('store_id', currentStore.id)
            .order('sort_order'),
          supabase
            .from('products')
            .select('id, name, price, description, product_images(id, public_url)')
            .eq('store_id', currentStore.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('store_assets')
            .select('*')
            .eq('store_id', currentStore.id)
            .order('sort_order')
        ]);

        if (themeResult.error) throw themeResult.error;
        if (pagesResult.error) throw pagesResult.error;
        if (productsResult.error) throw productsResult.error;
        if (assetsResult.error) throw assetsResult.error;

        const fallbackTemplate = templateOptions[0];
        setTheme(
          (themeResult.data as StoreThemeRow | null) ?? {
            id: '',
            template_code: fallbackTemplate.code,
            font: fallbackTemplate.font,
            primary_color: fallbackTemplate.primary,
            accent_color: fallbackTemplate.accent,
            tagline: currentStore.description ?? '',
            settings: {
              announcement_text: 'Welcome to our online store',
              hero_eyebrow: 'Live storefront',
              hero_title: currentStore.name,
              hero_subtitle:
                currentStore.description ??
                'Tell your customers what makes your store special.',
              hero_cta: 'Shop Collection',
              featured_title: 'Featured picks',
              featured_description: 'Edit your sections and products to shape this storefront.',
              about_heading: 'Our story',
              about_body: currentStore.description ?? 'Add your brand story here.',
              contact_heading: 'Talk to our team',
              footer_tagline: `${currentStore.name} on FEZZY`
            }
          }
        );
        setPages(
          ((pagesResult.data as StorePageRow[]) ?? []).length
            ? ((pagesResult.data as StorePageRow[]).map((page) => ({
                ...page,
                content: (page.content as JsonTextMap) ?? {}
              })) as StorePageRow[])
            : createDefaultPages(currentStore)
        );
        setProducts((productsResult.data ?? []) as ProductRow[]);
        setAssets((assetsResult.data ?? []) as StoreAssetRow[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load store builder.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [currentUser]);

  const selectedPage = useMemo(
    () => pages.find((page) => page.page_type === activePage) ?? null,
    [pages, activePage]
  );

  const logoImage = getAssetUrl(assets, 'logo');
  const heroImage = getAssetUrl(assets, 'hero');
  const aboutImage = getAssetUrl(assets, 'about');
  const galleryImages = assets
    .filter((asset) => asset.asset_type === 'gallery')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((asset) => asset.public_url)
    .filter(Boolean) as string[];
  const activeTemplate =
    templateOptions.find((template) => template.code === theme?.template_code) ?? templateOptions[0];

  const saveBuilder = async () => {
    if (!store || !theme) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const themePayload = {
        store_id: store.id,
        template_code: theme.template_code,
        font: theme.font,
        primary_color: theme.primary_color,
        accent_color: theme.accent_color,
        tagline: theme.tagline,
        settings: theme.settings,
        is_published: true,
        published_at: new Date().toISOString()
      };

      const { error: themeError } = await supabase
        .from('store_themes')
        .upsert(theme.id ? { ...themePayload, id: theme.id } : themePayload);
      if (themeError) throw themeError;

      const pagesPayload = pages.map((page, index) => ({
        id: page.id || undefined,
        store_id: store.id,
        page_type: page.page_type,
        title: page.title,
        slug: page.slug,
        description: page.description,
        content: page.content,
        show_in_nav: page.show_in_nav,
        sort_order: index,
        is_published: true
      }));

      const { error: pagesError } = await supabase.from('store_pages').upsert(pagesPayload);
      if (pagesError) throw pagesError;

      const { error: storeError } = await supabase
        .from('stores')
        .update({
          name: store.name,
          description: theme.tagline,
          contact_email: store.contact_email,
          contact_phone: store.contact_phone,
          business_address: store.business_address,
          country: store.country,
          currency_code: store.currency_code,
          logo_url: logoImage ?? store.logo_url,
          status: 'live'
        })
        .eq('id', store.id);
      if (storeError) throw storeError;

      setSuccess('Website changes saved and published.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save builder changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssetUpload = async (
    assetType: 'logo' | 'hero' | 'about' | 'gallery',
    file: File,
    sortOrder = 0
  ) => {
    if (!store) return;

    setIsSaving(true);
    setError('');

    try {
      const uploaded = await uploadImageToCloudinary(file, `fezzy/${store.slug}/${assetType}`);
      const existing =
        assetType === 'gallery'
          ? assets.find((asset) => asset.asset_type === assetType && asset.sort_order === sortOrder)
          : assets.find((asset) => asset.asset_type === assetType);

      const payload = {
        id: existing?.id,
        store_id: store.id,
        asset_type: assetType,
        storage_path: uploaded.publicId,
        public_url: uploaded.url,
        alt_text: `${store.name} ${assetType}`,
        sort_order: sortOrder
      };

      const { data, error: assetError } = await supabase
        .from('store_assets')
        .upsert(payload)
        .select('*')
        .single();

      if (assetError) throw assetError;

      setAssets((current) => {
        const filtered =
          assetType === 'gallery'
            ? current.filter(
                (asset) =>
                  !(asset.asset_type === assetType && asset.sort_order === sortOrder && asset.id !== data.id)
              )
            : current.filter((asset) => asset.asset_type !== assetType);

        return [...filtered.filter((asset) => asset.id !== data.id), data as StoreAssetRow].sort(
          (a, b) => a.sort_order - b.sort_order
        );
      });

      if (assetType === 'logo') {
        setStore((current) => (current ? { ...current, logo_url: uploaded.url } : current));
        await supabase.from('stores').update({ logo_url: uploaded.url }).eq('id', store.id);
      }

      setSuccess(`${capitalize(assetType)} image uploaded.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductImageUpload = async (productId: string, file: File) => {
    if (!store) return;

    setIsSaving(true);
    setError('');

    try {
      const uploaded = await uploadImageToCloudinary(file, `fezzy/${store.slug}/products`);
      const { error: imageError } = await supabase.from('product_images').insert({
        product_id: productId,
        storage_path: uploaded.publicId,
        public_url: uploaded.url,
        sort_order: 0
      });

      if (imageError) throw imageError;

      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? {
                ...product,
                product_images: [{ public_url: uploaded.url }]
              }
            : product
        )
      );
      setSuccess('Product image uploaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product image upload failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const generateAiDraft = () => {
    if (!store || !theme) {
      return;
    }

    setIsGeneratingAi(true);
    setError('');
    setSuccess('');

    try {
      const draft = buildAiDraft({
        brief: aiBrief,
        storeName: store.name,
        businessAddress: store.business_address ?? '',
        country: store.country ?? 'Kenya',
        contactPhone: store.contact_phone ?? '',
        templateCode: theme.template_code
      });

      const selectedTemplate = templateOptions.find((option) => option.code === draft.templateCode) ?? templateOptions[0];

      setTheme((current) =>
        current
          ? {
              ...current,
              template_code: selectedTemplate.code,
              font: selectedTemplate.font,
              primary_color: selectedTemplate.primary,
              accent_color: selectedTemplate.accent,
              tagline: draft.tagline,
              settings: {
                ...current.settings,
                announcement_text: draft.announcementText,
                hero_eyebrow: draft.heroEyebrow,
                hero_title: draft.heroTitle,
                hero_subtitle: draft.heroSubtitle,
                hero_cta: draft.heroCta,
                featured_title: draft.featuredTitle,
                featured_description: draft.featuredDescription,
                about_heading: draft.aboutHeading,
                about_body: draft.aboutBody,
                contact_heading: draft.contactHeading,
                footer_tagline: draft.footerTagline
              }
            }
          : current
      );

      setPages((current) =>
        current.map((page) => {
          if (page.page_type === 'home') {
            return {
              ...page,
              description: draft.homeDescription,
              content: {
                ...page.content,
                intro_badge: draft.heroEyebrow,
                promo_title: draft.featuredTitle,
                promo_body: draft.featuredDescription
              }
            };
          }

          if (page.page_type === 'shop') {
            return {
              ...page,
              description: draft.shopDescription,
              content: {
                ...page.content,
                collection_badge: draft.collectionBadge,
                collection_intro: draft.collectionIntro
              }
            };
          }

          if (page.page_type === 'about') {
            return {
              ...page,
              description: draft.aboutBody,
              content: {
                ...page.content,
                story_heading: draft.aboutHeading,
                story_body: draft.aboutBody
              }
            };
          }

          if (page.page_type === 'contact') {
            return {
              ...page,
              description: draft.contactDescription,
              content: {
                ...page.content,
                contact_heading: draft.contactHeading,
                shipping_notes: draft.shippingNotes,
                location_landmark: draft.locationLandmark
              }
            };
          }

          return page;
        })
      );

      setSuccess('AI assistant drafted a fresh website direction. Review and publish when ready.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI draft generation failed.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-16 text-muted-foreground">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        Loading builder...
      </div>
    );
  }

  if (!store || !theme) {
    return (
      <div className="py-16 text-center text-muted-foreground">No store found for this account.</div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] -m-4 flex flex-col lg:-m-8">
      {error && (
        <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mx-6 mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-2 font-semibold text-foreground">
            <LayoutTemplate className="h-4 w-4 text-primary" /> Store Builder
          </h1>
          <span className="text-sm text-muted-foreground">{store.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center rounded-md bg-muted p-1 sm:flex">
            <button
              className={`rounded-sm p-1.5 transition-colors ${
                previewMode === 'desktop'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              className={`rounded-sm p-1.5 transition-colors ${
                previewMode === 'mobile'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate && navigate('live-store')}>
            <Globe className="mr-2 h-4 w-4" /> View Live
          </Button>
          <Button size="sm" onClick={() => void saveBuilder()} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Publish Website'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Primary Navigation Sidebar */}
        <div className="flex w-[80px] shrink-0 flex-col items-center gap-4 border-r border-border bg-slate-50 py-6">
          <button
            onClick={() => setActiveTab('identity')}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
              activeTab === 'identity' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
            }`}
            title="Store Identity"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
              activeTab === 'theme' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
            }`}
            title="Theme & Style"
          >
            <Palette className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
              activeTab === 'pages' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
            }`}
            title="Pages"
          >
            <FileText className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('media')}
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
              activeTab === 'media' ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-200'
            }`}
            title="Media Library"
          >
            <ImageIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`mt-auto flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
              activeTab === 'ai' ? 'bg-orange-500 text-white shadow-[0_4px_12px_rgba(249,115,22,0.3)]' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
            }`}
            title="AI Site Assistant"
          >
            <Bot className="h-5 w-5" />
          </button>
        </div>

        {/* Properties Panel */}
        <div className="w-[340px] shrink-0 overflow-y-auto border-r border-border bg-card">
          <div className="p-6">
            {activeTab === 'identity' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Store Identity</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Edit your merchant basics and contact details.</p>
                </div>
                <div className="space-y-4">
                  <Field label="Brand Name">
                    <Input
                      value={store.name}
                      onChange={(e) =>
                        setStore((current) => (current ? { ...current, name: e.target.value } : current))
                      }
                    />
                  </Field>
                  <Field label="Tagline">
                    <Input
                      value={theme.tagline ?? ''}
                      onChange={(e) =>
                        setTheme((current) => (current ? { ...current, tagline: e.target.value } : current))
                      }
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Contact Email">
                      <Input
                        value={store.contact_email ?? ''}
                        onChange={(e) =>
                          setStore((current) =>
                            current ? { ...current, contact_email: e.target.value } : current
                          )
                        }
                      />
                    </Field>
                    <Field label="Contact Phone">
                      <Input
                        value={store.contact_phone ?? ''}
                        onChange={(e) =>
                          setStore((current) =>
                            current ? { ...current, contact_phone: e.target.value } : current
                          )
                        }
                      />
                    </Field>
                  </div>
                  <Field label="Business Address">
                    <Input
                      value={store.business_address ?? ''}
                      onChange={(e) =>
                        setStore((current) =>
                          current ? { ...current, business_address: e.target.value } : current
                        )
                      }
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Country">
                      <Input
                        value={store.country ?? ''}
                        onChange={(e) =>
                          setStore((current) => (current ? { ...current, country: e.target.value } : current))
                        }
                      />
                    </Field>
                    <Field label="Currency">
                      <Input
                        value={store.currency_code}
                        onChange={(e) =>
                          setStore((current) =>
                            current ? { ...current, currency_code: e.target.value.toUpperCase() } : current
                          )
                        }
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Look & Layout</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Pick a stronger website direction, then refine it.</p>
                </div>
                
                <div className="rounded-[20px] border border-border bg-muted/20 p-4">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Active Template</p>
                  <p className="text-sm font-semibold text-foreground">{activeTemplate.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{activeTemplate.mood}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{activeTemplate.note}</p>
                </div>

                <div className="grid gap-3">
                  {templateOptions.map((template) => (
                    <button
                      key={template.code}
                      type="button"
                      onClick={() => applyTemplatePreset(template.code, setTheme)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        template.code === theme.template_code
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-background hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{template.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{template.mood}</p>
                        </div>
                        <div className="flex gap-2">
                          <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: template.primary }} />
                          <span className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: template.accent }} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Primary Color">
                    <Input
                      value={theme.primary_color ?? ''}
                      onChange={(e) => setTheme((current) => current ? { ...current, primary_color: e.target.value } : current)}
                    />
                  </Field>
                  <Field label="Accent Color">
                    <Input
                      value={theme.accent_color ?? ''}
                      onChange={(e) => setTheme((current) => current ? { ...current, accent_color: e.target.value } : current)}
                    />
                  </Field>
                </div>
                <Field label="Font">
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={theme.font ?? templateOptions[0].font}
                    onChange={(e) => setTheme((current) => (current ? { ...current, font: e.target.value } : current))}
                  >
                    {templateOptions.map((template) => (
                      <option key={template.code} value={template.font}>{template.font}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {activeTab === 'pages' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Content & Pages</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Select a page to edit its specific details.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pages.map((page) => (
                    <button
                      key={page.page_type}
                      type="button"
                      onClick={() => setActivePage(page.page_type)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        activePage === page.page_type
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {capitalize(page.page_type)}
                    </button>
                  ))}
                </div>

                {selectedPage && (
                  <div className="space-y-4 rounded-2xl border border-border bg-slate-50/50 p-4">
                    <Field label="Page Title">
                      <Input
                        value={selectedPage.title}
                        onChange={(e) => updatePage(setPages, selectedPage.page_type, { title: e.target.value })}
                      />
                    </Field>
                    <Field label="Page Description">
                      <textarea
                        className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={selectedPage.description ?? ''}
                        onChange={(e) => updatePage(setPages, selectedPage.page_type, { description: e.target.value })}
                      />
                    </Field>

                    {selectedPage.page_type === 'shop' && (
                      <div className="space-y-4 pt-2">
                        <Field label="Collection Badge">
                          <Input
                            value={selectedPage.content?.collection_badge ?? ''}
                            onChange={(e) => updatePageContent(setPages, selectedPage.page_type, 'collection_badge', e.target.value)}
                          />
                        </Field>
                        <Field label="Collection Intro">
                          <textarea
                            className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedPage.content?.collection_intro ?? ''}
                            onChange={(e) => updatePageContent(setPages, selectedPage.page_type, 'collection_intro', e.target.value)}
                          />
                        </Field>
                      </div>
                    )}

                    {selectedPage.page_type === 'about' && (
                      <div className="space-y-4 pt-2">
                        <Field label="About Heading">
                          <Input
                            value={theme.settings?.about_heading ?? ''}
                            onChange={(e) => updateThemeSetting(setTheme, 'about_heading', e.target.value)}
                          />
                        </Field>
                        <Field label="About Story">
                          <textarea
                            className="flex min-h-[110px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedPage.content?.story_body ?? theme.settings?.about_body ?? ''}
                            onChange={(e) => {
                              updatePageContent(setPages, selectedPage.page_type, 'story_body', e.target.value);
                              updateThemeSetting(setTheme, 'about_body', e.target.value);
                            }}
                          />
                        </Field>
                        <Field label="Location Landmark">
                          <Input
                            value={selectedPage.content?.location_landmark ?? ''}
                            onChange={(e) => updatePageContent(setPages, selectedPage.page_type, 'location_landmark', e.target.value)}
                          />
                        </Field>
                      </div>
                    )}

                    {selectedPage.page_type === 'contact' && (
                      <div className="space-y-4 pt-2">
                        <Field label="Contact Heading">
                          <Input
                            value={theme.settings?.contact_heading ?? ''}
                            onChange={(e) => updateThemeSetting(setTheme, 'contact_heading', e.target.value)}
                          />
                        </Field>
                        <Field label="Shipping Zones">
                          <Input
                            value={selectedPage.content?.shipping_zones ?? ''}
                            onChange={(e) => updatePageContent(setPages, selectedPage.page_type, 'shipping_zones', e.target.value)}
                          />
                        </Field>
                        <Field label="Shipping Timeline">
                          <Input
                            value={selectedPage.content?.shipping_timeline ?? ''}
                            onChange={(e) => updatePageContent(setPages, selectedPage.page_type, 'shipping_timeline', e.target.value)}
                          />
                        </Field>
                        <Field label="Shipping Notes">
                          <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedPage.content?.shipping_notes ?? ''}
                            onChange={(e) => updatePageContent(setPages, selectedPage.page_type, 'shipping_notes', e.target.value)}
                          />
                        </Field>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-6 border-t border-border space-y-4">
                  <h3 className="text-sm font-semibold">Homepage Copy</h3>
                  <Field label="Announcement">
                    <Input
                      value={theme.settings?.announcement_text ?? ''}
                      onChange={(e) => updateThemeSetting(setTheme, 'announcement_text', e.target.value)}
                    />
                  </Field>
                  <Field label="Hero Eyebrow">
                    <Input
                      value={theme.settings?.hero_eyebrow ?? ''}
                      onChange={(e) => updateThemeSetting(setTheme, 'hero_eyebrow', e.target.value)}
                    />
                  </Field>
                  <Field label="Hero Title">
                    <Input
                      value={theme.settings?.hero_title ?? ''}
                      onChange={(e) => updateThemeSetting(setTheme, 'hero_title', e.target.value)}
                    />
                  </Field>
                  <Field label="Hero Subtitle">
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={theme.settings?.hero_subtitle ?? ''}
                      onChange={(e) => updateThemeSetting(setTheme, 'hero_subtitle', e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Hero CTA">
                      <Input
                        value={theme.settings?.hero_cta ?? ''}
                        onChange={(e) => updateThemeSetting(setTheme, 'hero_cta', e.target.value)}
                      />
                    </Field>
                    <Field label="Featured Title">
                      <Input
                        value={theme.settings?.featured_title ?? ''}
                        onChange={(e) => updateThemeSetting(setTheme, 'featured_title', e.target.value)}
                      />
                    </Field>
                  </div>
                  <Field label="Featured Description">
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={theme.settings?.featured_description ?? ''}
                      onChange={(e) => updateThemeSetting(setTheme, 'featured_description', e.target.value)}
                    />
                  </Field>
                  <Field label="Footer Tagline">
                    <Input
                      value={theme.settings?.footer_tagline ?? ''}
                      onChange={(e) => updateThemeSetting(setTheme, 'footer_tagline', e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Media Library</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Upload brand, location, and product images.</p>
                </div>
                <div className="space-y-3">
                  <UploadRow label="Logo" image={logoImage} onFile={(file) => void handleAssetUpload('logo', file)} />
                  <UploadRow label="Hero Image" image={heroImage} onFile={(file) => void handleAssetUpload('hero', file)} />
                  <UploadRow label="About Image" image={aboutImage} onFile={(file) => void handleAssetUpload('about', file)} />
                  {[0, 1].map((slot) => (
                    <UploadRow
                      key={slot}
                      label={`Gallery Image ${slot + 1}`}
                      image={galleryImages[slot] ?? null}
                      onFile={(file) => void handleAssetUpload('gallery', file, slot)}
                    />
                  ))}
                  {products.slice(0, 4).map((product) => (
                    <UploadRow
                      key={product.id}
                      label={`Product: ${product.name}`}
                      image={product.product_images?.[0]?.public_url ?? null}
                      onFile={(file) => void handleProductImageUpload(product.id, file)}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                    <Bot className="h-5 w-5 text-orange-500" /> AI Site Assistant
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Describe the brand and products. The assistant will draft a stronger starting website.
                  </p>
                </div>
                <div className="space-y-4">
                  <textarea
                    className="flex min-h-[160px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    placeholder="Example: Modern skincare store in Nairobi for busy professionals. Clean visuals, premium but warm tone, highlight same-day delivery."
                    value={aiBrief}
                    onChange={(e) => setAiBrief(e.target.value)}
                  />
                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-none shadow-md"
                    onClick={generateAiDraft}
                    disabled={isGeneratingAi}
                  >
                    {isGeneratingAi ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin text-white" />
                        <span className="text-white">Drafting website...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 text-white" />
                        <span className="text-white">Generate AI Draft</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100/60 p-4 md:p-8 flex justify-center items-start">
          <StorePreview
            store={store}
            theme={theme}
            activeTemplate={activeTemplate}
            pages={pages}
            products={products}
            previewMode={previewMode}
            logoImage={logoImage}
            heroImage={heroImage}
            aboutImage={aboutImage}
            galleryImages={galleryImages}
            activePage={activePage}
            onSelectPage={setActivePage}
          />
        </div>
      </div>
    </div>
  );
}

function StorePreview({
  store,
  theme,
  activeTemplate,
  pages,
  products,
  previewMode,
  logoImage,
  heroImage,
  aboutImage,
  galleryImages,
  activePage,
  onSelectPage
}: {
  store: StoreRecord;
  theme: StoreThemeRow;
  activeTemplate: TemplateOption;
  pages: StorePageRow[];
  products: ProductRow[];
  previewMode: PreviewMode;
  logoImage: string | null;
  heroImage: string | null;
  aboutImage: string | null;
  galleryImages: string[];
  activePage: BuilderPageType;
  onSelectPage: (page: BuilderPageType) => void;
}) {
  const active = pages.find((page) => page.page_type === activePage);
  const shopPage = pages.find((page) => page.page_type === 'shop');
  const aboutPage = pages.find((page) => page.page_type === 'about');
  const contactPage = pages.find((page) => page.page_type === 'contact');
  const templateSurface = getTemplateSurface(activeTemplate.code);

  return (
    <div
      className={`mx-auto overflow-hidden border border-border bg-background shadow-2xl ${
        previewMode === 'mobile'
          ? 'w-[375px] rounded-[2rem] border-8 border-gray-900'
          : 'w-full max-w-6xl rounded-[28px]'
      }`}
      style={{ fontFamily: theme.font ?? 'sans-serif' }}
    >
      <div
        className="px-6 py-3 text-center text-sm font-medium text-white"
        style={{ backgroundColor: theme.primary_color ?? '#000' }}
      >
        {theme.settings?.announcement_text || 'Welcome to our store'}
      </div>

      <header
        className={`border-b border-border backdrop-blur ${templateSurface.headerClass}`}
        style={templateSurface.headerStyle}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-muted">
              {logoImage ? (
                <img src={logoImage} alt={store.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-foreground">
                  {store.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">{store.name}</p>
              <p className="text-xs text-muted-foreground">{theme.tagline}</p>
            </div>
          </div>
          <nav className="hidden items-center gap-2 md:flex">
            {pages
              .filter((page) => page.show_in_nav)
              .map((page) => (
                <button
                  key={page.page_type}
                  type="button"
                  onClick={() => onSelectPage(page.page_type)}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    page.page_type === activePage
                      ? 'text-white'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                  style={
                    page.page_type === activePage
                      ? { backgroundColor: theme.primary_color ?? '#000' }
                      : undefined
                  }
                >
                  {page.title}
                </button>
              ))}
          </nav>
        </div>
      </header>

      <div className={`min-h-[760px] ${templateSurface.pageClass}`} style={templateSurface.pageStyle}>
        {activePage === 'home' && (
          <>
            <section className={`px-8 py-16 md:px-14 md:py-20 ${templateSurface.heroSectionClass}`}>
              <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
                <div>
                  <p
                    className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]"
                    style={{
                      backgroundColor: `${theme.accent_color ?? '#111827'}20`,
                      color: theme.accent_color ?? '#333'
                    }}
                  >
                    {theme.settings?.hero_eyebrow}
                  </p>
                  <h2 className="mt-6 text-4xl font-bold leading-tight text-foreground md:text-6xl">
                    {theme.settings?.hero_title || store.name}
                  </h2>
                  <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
                    {theme.settings?.hero_subtitle}
                  </p>
                  <Button
                    className="mt-8"
                    style={{
                      backgroundColor: theme.primary_color ?? '#000',
                      color: 'white'
                    }}
                  >
                    {theme.settings?.hero_cta || 'Shop'}
                  </Button>
                </div>
                <div className={`overflow-hidden rounded-[28px] border border-border p-5 shadow-sm ${templateSurface.heroMediaClass}`}>
                  {heroImage ? (
                    <img
                      src={heroImage}
                      alt={store.name}
                      className="aspect-[4/5] w-full rounded-[24px] object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/5] rounded-[24px] bg-gradient-to-br from-white to-orange-100" />
                  )}
                </div>
              </div>
            </section>

            <section className="px-8 pb-8 md:px-14">
              <Card
                className={`rounded-[28px] border-none text-white ${templateSurface.featureCardClass}`}
                style={templateSurface.featureCardStyle}
              >
                <CardContent className="grid gap-4 p-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-orange-200">
                      {shopPage?.content?.collection_badge || 'Featured'}
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold">
                      {theme.settings?.featured_title || 'Featured picks'}
                    </h3>
                  </div>
                  <p className="text-sm leading-7 text-slate-300">
                    {theme.settings?.featured_description || shopPage?.content?.collection_intro}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="px-8 py-8 md:px-14">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.slice(0, 6).map((product) => (
                  <Card
                    key={product.id}
                    className="overflow-hidden rounded-[28px] border-border/60 bg-white/85"
                  >
                    {product.product_images?.[0]?.public_url ? (
                      <img
                        src={product.product_images[0].public_url ?? ''}
                        alt={product.name}
                        className="aspect-[4/4.5] w-full object-cover"
                      />
                    ) : (
                      <div className="aspect-[4/4.5] bg-muted" />
                    )}
                    <CardContent className="p-6">
                      <p className="text-lg font-semibold text-foreground">{product.name}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {product.description ?? 'No description'}
                      </p>
                      <p className="mt-4 text-base font-semibold text-foreground">
                        {formatCurrency(product.price, store.currency_code)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section className="px-8 py-10 md:px-14 md:pb-16">
              <div className="grid gap-4 md:grid-cols-2">
                {(galleryImages.length ? galleryImages : [null, null]).slice(0, 2).map((image, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[28px] border border-border bg-white p-3 shadow-sm"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={`${store.name} gallery ${index + 1}`}
                        className="aspect-[4/3] w-full rounded-[22px] object-cover"
                      />
                    ) : (
                      <div className="aspect-[4/3] rounded-[22px] bg-gradient-to-br from-stone-100 to-orange-100" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activePage === 'shop' && (
          <section className={`px-8 py-16 md:px-14 ${templateSurface.secondarySectionClass}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {shopPage?.content?.collection_badge || 'Collection'}
            </p>
            <h2 className="mt-3 text-4xl font-bold text-foreground">{active?.title ?? 'Shop'}</h2>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              {shopPage?.content?.collection_intro || active?.description}
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden rounded-[28px] border-border/60 bg-white/85"
                >
                  {product.product_images?.[0]?.public_url ? (
                    <img
                      src={product.product_images[0].public_url ?? ''}
                      alt={product.name}
                      className="aspect-[4/4.5] w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/4.5] bg-muted" />
                  )}
                  <CardContent className="p-6">
                    <p className="text-lg font-semibold text-foreground">{product.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{product.description ?? ''}</p>
                    <p className="mt-4 text-base font-semibold text-foreground">
                      {formatCurrency(product.price, store.currency_code)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {activePage === 'about' && (
          <section className={`px-8 py-16 md:px-14 ${templateSurface.secondarySectionClass}`}>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[32px] border border-border bg-white/80 p-6 shadow-sm">
                {aboutImage ? (
                  <img
                    src={aboutImage}
                    alt={`${store.name} about`}
                    className="aspect-[4/5] w-full rounded-[26px] object-cover"
                  />
                ) : (
                  <div className="aspect-[4/5] rounded-[26px] bg-gradient-to-br from-white to-stone-200" />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <p
                  className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
                  style={{
                    backgroundColor: `${theme.primary_color ?? '#111827'}18`,
                    color: theme.primary_color ?? '#111827'
                  }}
                >
                  {theme.settings?.about_heading || 'About'}
                </p>
                <h2 className="mt-4 text-4xl font-bold text-foreground">
                  {aboutPage?.title ?? 'About'}
                </h2>
                <p className="mt-6 text-lg leading-8 text-muted-foreground">
                  {aboutPage?.content?.story_body || theme.settings?.about_body || aboutPage?.description}
                </p>
                <div className="mt-8 space-y-2 text-sm text-muted-foreground">
                  <p>{store.business_address ?? 'Add your store location'}</p>
                  <p>{aboutPage?.content?.location_landmark ?? 'Add your landmark'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {activePage === 'contact' && (
          <section className={`px-8 py-16 md:px-14 ${templateSurface.secondarySectionClass}`}>
            <Card
              className={`rounded-[32px] border-none text-slate-50 ${templateSurface.featureCardClass}`}
              style={templateSurface.featureCardStyle}
            >
              <CardContent className="grid gap-8 p-8 md:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-orange-200">
                    {theme.settings?.contact_heading || 'Contact'}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold">{active?.title ?? 'Contact'}</h2>
                  <p className="mt-4 text-slate-300 leading-7">
                    {active?.description || contactPage?.content?.shipping_notes}
                  </p>
                </div>
                <div className="space-y-4 text-sm text-slate-300">
                  <p>{store.contact_email ?? 'No email'}</p>
                  <p>{store.contact_phone ?? 'No phone'}</p>
                  <p>{store.business_address ?? 'No address'}</p>
                  <p>{contactPage?.content?.location_landmark ?? 'No landmark yet'}</p>
                  <p>Delivery: {contactPage?.content?.shipping_zones ?? 'Not set'}</p>
                  <p>Timeline: {contactPage?.content?.shipping_timeline ?? 'Not set'}</p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </div>

      <footer className="border-t border-border bg-slate-950 px-8 py-6 text-slate-300 md:px-14">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm">{theme.settings?.footer_tagline || `${store.name} on FEZZY`}</p>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {store.subdomain}.fezzy.shop
          </p>
        </div>
      </footer>
    </div>
  );
}

function UploadRow({
  label,
  image,
  onFile
}: {
  label: string;
  image: string | null | undefined;
  onFile: (file: File) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border bg-background p-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted">
        {image ? (
          <img src={image} alt={label} className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{image ? 'Replace image' : 'Upload image'}</p>
      </div>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </label>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        {label === 'Primary Color' && <Palette className="h-3 w-3" />}
        {label === 'Accent Color' && <Palette className="h-3 w-3" />}
        {label === 'Font' && <Type className="h-3 w-3" />}
        {label}
      </label>
      {children}
    </div>
  );
}

function updateThemeSetting(
  setTheme: React.Dispatch<React.SetStateAction<StoreThemeRow | null>>,
  key: string,
  value: string
) {
  setTheme((current) =>
    current
      ? {
          ...current,
          settings: {
            ...(current.settings ?? {}),
            [key]: value
          }
        }
      : current
  );
}

function updatePage(
  setPages: React.Dispatch<React.SetStateAction<StorePageRow[]>>,
  pageType: BuilderPageType,
  patch: Partial<StorePageRow>
) {
  setPages((current) =>
    current.map((page) => (page.page_type === pageType ? { ...page, ...patch } : page))
  );
}

function updatePageContent(
  setPages: React.Dispatch<React.SetStateAction<StorePageRow[]>>,
  pageType: BuilderPageType,
  key: string,
  value: string
) {
  setPages((current) =>
    current.map((page) =>
      page.page_type === pageType
        ? {
            ...page,
            content: {
              ...(page.content ?? {}),
              [key]: value
            }
          }
        : page
    )
  );
}

function applyTemplatePreset(
  templateCode: string,
  setTheme: React.Dispatch<React.SetStateAction<StoreThemeRow | null>>
) {
  const selected = templateOptions.find((template) => template.code === templateCode);
  if (!selected) return;

  setTheme((current) =>
    current
      ? {
          ...current,
          template_code: selected.code,
          font: selected.font,
          primary_color: selected.primary,
          accent_color: selected.accent,
          settings: {
            ...current.settings,
            announcement_text:
              current.settings?.announcement_text ||
              `Discover ${selected.mood.toLowerCase()} design for your storefront`,
            hero_eyebrow: current.settings?.hero_eyebrow || selected.mood,
            featured_title: current.settings?.featured_title || `Built with ${selected.name}`,
            footer_tagline:
              current.settings?.footer_tagline || `${selected.name} storefront on FEZZY`
          }
        }
      : current
  );
}

function createDefaultPages(store: StoreRecord): StorePageRow[] {
  return [
    {
      id: '',
      page_type: 'home',
      title: 'Home',
      slug: '/',
      description: store.description,
      content: {
        intro_badge: 'Now online',
        promo_title: `Shop ${store.name}`,
        promo_body: store.description ?? 'Introduce your latest offers here.'
      },
      show_in_nav: true,
      sort_order: 0
    },
    {
      id: '',
      page_type: 'shop',
      title: 'Shop',
      slug: '/shop',
      description: 'Browse your store catalog.',
      content: {
        collection_badge: 'Available now',
        collection_intro: 'Explore your latest products and featured picks.'
      },
      show_in_nav: true,
      sort_order: 1
    },
    {
      id: '',
      page_type: 'about',
      title: 'About',
      slug: '/about',
      description: store.description,
      content: {
        story_heading: 'Our story',
        story_body: store.description ?? 'Tell customers why your store exists.',
        location_landmark: ''
      },
      show_in_nav: true,
      sort_order: 2
    },
    {
      id: '',
      page_type: 'contact',
      title: 'Contact',
      slug: '/contact',
      description: 'Get in touch with the store team.',
      content: {
        shipping_zones: '',
        shipping_timeline: '',
        shipping_notes: '',
        location_landmark: ''
      },
      show_in_nav: true,
      sort_order: 3
    }
  ];
}

function getAssetUrl(assets: StoreAssetRow[], assetType: string, sortOrder = 0) {
  const match =
    assetType === 'gallery'
      ? assets.find((asset) => asset.asset_type === assetType && asset.sort_order === sortOrder)
      : assets.find((asset) => asset.asset_type === assetType);

  return match?.public_url ?? null;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function buildAiDraft({
  brief,
  storeName,
  businessAddress,
  country,
  contactPhone,
  templateCode
}: {
  brief: string;
  storeName: string;
  businessAddress: string;
  country: string;
  contactPhone: string;
  templateCode: string;
}) {
  const normalizedBrief = brief.trim();
  const source = normalizedBrief || `${storeName} serving customers in ${country}`;
  const lower = source.toLowerCase();

  const nextTemplate =
    /(luxury|premium|elegant|boutique|bridal|jewelry)/.test(lower)
      ? 'atelier-luxe'
      : /(fashion|runway|apparel|beauty|cosmetic|boutique)/.test(lower)
        ? 'fashion-runway'
      : /(tech|digital|electronics|smart|modern|gadget)/.test(lower)
        ? 'electronics-grid'
        : /(editorial|story|showcase|statement)/.test(lower)
          ? 'signify-commerce'
        : templateCode || 'market-fresh';

  const audience =
    /(family|kids|home)/.test(lower)
      ? 'families and everyday shoppers'
      : /(professional|executive|office)/.test(lower)
        ? 'busy professionals'
        : /(youth|gen z|student)/.test(lower)
          ? 'young, style-led shoppers'
          : 'modern local shoppers';

  const locationLine = businessAddress ? ` from ${businessAddress}` : '';
  const speedLine = /(same day|fast|express)/.test(lower)
    ? 'Fast fulfillment and quick dispatch are front and center.'
    : 'A clear, trustworthy buying journey leads the experience.';

  const contactLine = contactPhone
    ? `Customers can reach the team directly on ${contactPhone}.`
    : 'Customers can reach the team directly for delivery and support.';

  return {
    templateCode: nextTemplate,
    tagline: `Curated for ${audience}${locationLine}`,
    announcementText: 'Fresh arrivals, trusted service, and easy ordering online',
    heroEyebrow: /(premium|luxury|elegant)/.test(lower) ? 'Refined essentials' : 'Built for everyday shoppers',
    heroTitle: `${storeName}, crafted for ${audience}`,
    heroSubtitle: `${source}. ${speedLine}`,
    heroCta: /(book|appointment|service)/.test(lower) ? 'Book Now' : 'Shop Now',
    featuredTitle: 'Signature products worth opening first',
    featuredDescription: `Use this section to spotlight your best sellers, limited drops, or seasonal bundles for ${audience}.`,
    aboutHeading: 'The story behind the store',
    aboutBody: `${storeName} brings a clearer shopping experience to ${audience}${locationLine}. ${contactLine}`,
    contactHeading: 'Reach the merchant team',
    footerTagline: `${storeName} on FEZZY`,
    homeDescription: `${storeName} is now online with a storefront tailored for ${audience}.`,
    shopDescription: `Browse the catalog and discover what ${storeName} has prepared for ${audience}.`,
    collectionBadge: /(new|drop|launch)/.test(lower) ? 'New drop' : 'Editor picks',
    collectionIntro: `Lead with your strongest categories and help ${audience} find the right products faster.`,
    contactDescription: `Make ordering feel easy with clear delivery expectations, merchant contact channels, and pickup guidance.`,
    shippingNotes: /(same day|fast|express)/.test(lower)
      ? 'Offer clear same-day and next-day delivery guidance for the main service zones.'
      : 'Explain delivery zones, dispatch windows, and pickup options in simple language.',
    locationLandmark: businessAddress ? `Visit us near ${businessAddress}` : `Serving customers across ${country}`
  };
}

function getTemplateSurface(templateCode: string) {
  if (templateCode === 'atelier-luxe') {
    return {
      headerClass: 'bg-stone-950/95',
      headerStyle: undefined,
      pageClass: 'bg-[#f7f1eb]',
      pageStyle: undefined,
      heroSectionClass: '',
      heroMediaClass: 'bg-[#f4e7dc]',
      featureCardClass: 'bg-[#2b211d]',
      featureCardStyle: undefined,
      secondarySectionClass: ''
    };
  }

  if (templateCode === 'shoplaza-block') {
    return {
      headerClass: 'bg-white/95',
      headerStyle: undefined,
      pageClass: 'bg-[#f7f7f5]',
      pageStyle: undefined,
      heroSectionClass: '',
      heroMediaClass: 'bg-[#fff8ee]',
      featureCardClass: 'bg-[#111827]',
      featureCardStyle: undefined,
      secondarySectionClass: ''
    };
  }

  if (templateCode === 'signify-commerce') {
    return {
      headerClass: 'bg-[#1e1b4b]/95',
      headerStyle: undefined,
      pageClass: 'bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_45%,#eef2ff_100%)]',
      pageStyle: undefined,
      heroSectionClass: '',
      heroMediaClass: 'bg-[#fdf2f8]',
      featureCardClass: 'bg-[#312e81]',
      featureCardStyle: undefined,
      secondarySectionClass: ''
    };
  }

  if (templateCode === 'electronics-grid' || templateCode === 'tech-minimal') {
    return {
      headerClass: 'bg-slate-950/95',
      headerStyle: undefined,
      pageClass: 'bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#ecfeff_100%)]',
      pageStyle: undefined,
      heroSectionClass: '',
      heroMediaClass: 'bg-[#e0f2fe]',
      featureCardClass: 'bg-slate-950',
      featureCardStyle: undefined,
      secondarySectionClass: ''
    };
  }

  if (templateCode === 'fashion-runway') {
    return {
      headerClass: 'bg-[#fff1f2]/95',
      headerStyle: undefined,
      pageClass: 'bg-[linear-gradient(180deg,#fff1f2_0%,#ffffff_35%,#fff7ed_100%)]',
      pageStyle: undefined,
      heroSectionClass: '',
      heroMediaClass: 'bg-[#ffe4e6]',
      featureCardClass: 'bg-[#831843]',
      featureCardStyle: undefined,
      secondarySectionClass: ''
    };
  }

  return {
    headerClass: 'bg-background/90',
    headerStyle: undefined,
    pageClass: 'bg-white',
    pageStyle: undefined,
    heroSectionClass: '',
    heroMediaClass: 'bg-white/80',
    featureCardClass: 'bg-slate-950',
    featureCardStyle: undefined,
    secondarySectionClass: ''
  };
}
