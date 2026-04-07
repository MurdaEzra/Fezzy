import React, { useEffect, useMemo, useState } from 'react';
import {
  Edit,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import { supabase } from '../contexts/supabaseClient';
import { uploadImageToCloudinary } from '../lib/cloudinary';
import { formatCurrency, getCurrentStoreForUser, type StoreRecord } from '../lib/store';
import type { SessionUser } from '../App';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';

type ProductRow = {
  id: string;
  name: string;
  category_id: string | null;
  sku: string | null;
  price: number;
  stock_quantity: number;
  status: string;
  created_at: string;
  categories?: { name: string } | null;
  product_images?: Array<{ public_url: string | null }>;
};

interface ProductsPageProps {
  currentUser: SessionUser;
}

export function ProductsPage({ currentUser }: ProductsPageProps) {
  const [store, setStore] = useState<StoreRecord | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: '',
    sku: '',
    price: '',
    stock: '',
    description: '',
    imageFile: null as File | null
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError('');

      try {
        const currentStore = await getCurrentStoreForUser(currentUser);
        setStore(currentStore);

        if (!currentStore) {
          setProducts([]);
          return;
        }

        const { data, error: productsError } = await supabase
          .from('products')
          .select(
            'id, name, category_id, sku, price, stock_quantity, status, created_at, categories(name), product_images(public_url)'
          )
          .eq('store_id', currentStore.id)
          .order('created_at', { ascending: false });

        if (productsError) {
          throw productsError;
        }

        setProducts((data ?? []) as ProductRow[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [currentUser]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return products;
    }

    return products.filter((product) =>
      `${product.name} ${product.sku ?? ''} ${product.categories?.name ?? ''}`
        .toLowerCase()
        .includes(query)
    );
  }, [products, search]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!store) {
      setError('No store was found for this account.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      let categoryId: string | null = null;
      const categoryName = form.category.trim();

      if (categoryName) {
        const categorySlug = slugify(categoryName);
        const { data: category, error: categoryError } = await supabase
          .from('categories')
          .upsert(
            {
              store_id: store.id,
              name: categoryName,
              slug: categorySlug
            },
            { onConflict: 'store_id,slug' }
          )
          .select('id')
          .single();

        if (categoryError) {
          throw categoryError;
        }

        categoryId = category.id;
      }

      const productPayload = {
        store_id: store.id,
        category_id: categoryId,
        name: form.name.trim(),
        slug: slugify(form.name),
        sku: form.sku.trim() || null,
        description: form.description.trim() || null,
        price: Number(form.price || 0),
        stock_quantity: Number(form.stock || 0),
        status: Number(form.stock || 0) > 0 ? 'active' : 'out_of_stock',
        currency_code: store.currency_code || 'KES'
      };

      const { data: insertedProduct, error: insertError } = await supabase
        .from('products')
        .insert(productPayload)
        .select(
          'id, name, category_id, sku, price, stock_quantity, status, created_at, categories(name), product_images(public_url)'
        )
        .single();

      if (insertError) {
        throw insertError;
      }

      if (form.imageFile) {
        const uploaded = await uploadImageToCloudinary(
          form.imageFile,
          `fezzy/${store.slug}/products`
        );

        const { error: imageError } = await supabase.from('product_images').insert({
          product_id: insertedProduct.id,
          storage_path: uploaded.publicId,
          public_url: uploaded.url,
          alt_text: insertedProduct.name,
          sort_order: 0
        });

        if (imageError) {
          throw imageError;
        }

        insertedProduct.product_images = [{ public_url: uploaded.url }];
      }

      setProducts((current) => [insertedProduct as ProductRow, ...current]);
      setIsAddModalOpen(false);
      setForm({
        name: '',
        category: '',
        sku: '',
        price: '',
        stock: '',
        description: '',
        imageFile: null
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    const previous = products;
    setProducts((current) => current.filter((product) => product.id !== productId));

    const { error: deleteError } = await supabase.from('products').delete().eq('id', productId);

    if (deleteError) {
      setProducts(previous);
      setError(deleteError.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory from Supabase and store product imagery in Cloudinary.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <Upload className="mr-2 h-4 w-4" /> Bulk Upload CSV
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              {store ? `${store.name} catalog` : 'No store connected'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-3 py-16 text-muted-foreground">
              <LoaderCircle className="h-5 w-5 animate-spin" />
              Loading products...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              No products found yet. Add your first product to start selling.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-md w-16">Image</th>
                    <th className="px-4 py-3 font-medium">Product Name</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Stock</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right rounded-tr-md">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-4 py-3">
                        {product.product_images?.[0]?.public_url ? (
                          <img
                            src={product.product_images[0].public_url ?? ''}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover border border-border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center border border-border">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{product.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {product.categories?.name ?? 'Uncategorized'}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatCurrency(product.price, store?.currency_code)}
                      </td>
                      <td className="px-4 py-3">{product.stock_quantity}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => void handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl shadow-2xl border-border">
            <CardHeader className="sticky top-0 bg-card z-10 border-b border-border flex flex-row items-center justify-between">
              <CardTitle>Add New Product</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Product Name</label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Category</label>
                    <Input
                      value={form.category}
                      onChange={(e) =>
                        setForm((current) => ({ ...current, category: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">SKU</label>
                    <Input
                      value={form.sku}
                      onChange={(e) => setForm((current) => ({ ...current, sku: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Price</label>
                    <Input
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Stock</label>
                    <Input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(e) => setForm((current) => ({ ...current, stock: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.description}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, description: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Product Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        imageFile: e.target.files?.[0] ?? null
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Save Product
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active') {
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">Active</Badge>;
  }

  if (status === 'out_of_stock') {
    return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Out of Stock</Badge>;
  }

  if (status === 'draft') {
    return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-none">Draft</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
