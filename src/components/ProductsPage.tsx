import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Upload,
  Sparkles,
  X,
  Image as ImageIcon } from
'lucide-react';
export function ProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiDescription, setAiDescription] = useState('');
  const mockProducts = [
  {
    id: 1,
    name: 'Premium Kikoy Fabric',
    category: 'Clothing',
    price: 'KES 1,500',
    stock: 45,
    status: 'Active',
    img: 'bg-orange-200'
  },
  {
    id: 2,
    name: 'Handmade Maasai Necklace',
    category: 'Jewelry',
    price: 'KES 2,200',
    stock: 12,
    status: 'Active',
    img: 'bg-red-200'
  },
  {
    id: 3,
    name: 'Kenyan AA Coffee Beans (500g)',
    category: 'Food & Beverage',
    price: 'KES 1,800',
    stock: 105,
    status: 'Active',
    img: 'bg-amber-800'
  },
  {
    id: 4,
    name: 'Carved Wooden Elephant',
    category: 'Home Decor',
    price: 'KES 4,500',
    stock: 3,
    status: 'Low Stock',
    img: 'bg-stone-300'
  },
  {
    id: 5,
    name: 'Kitenge Print Dress',
    category: 'Clothing',
    price: 'KES 3,500',
    stock: 0,
    status: 'Out of Stock',
    img: 'bg-purple-300'
  },
  {
    id: 6,
    name: 'Leather Sandals (Akala)',
    category: 'Footwear',
    price: 'KES 1,200',
    stock: 28,
    status: 'Active',
    img: 'bg-amber-600'
  },
  {
    id: 7,
    name: 'Woven Sisal Basket (Kiondo)',
    category: 'Home Decor',
    price: 'KES 2,800',
    stock: 15,
    status: 'Active',
    img: 'bg-yellow-200'
  },
  {
    id: 8,
    name: 'Organic Macadamia Nuts',
    category: 'Food & Beverage',
    price: 'KES 900',
    stock: 60,
    status: 'Active',
    img: 'bg-orange-100'
  }];

  const handleGenerateAI = () => {
    setIsGeneratingAI(true);
    setAiDescription('');
    // Simulate typing effect
    const text =
    'Elevate your style with this authentic, handcrafted piece. Made with premium locally-sourced materials, it perfectly blends traditional African heritage with modern design. Perfect for everyday wear or special occasions. Durable, vibrant, and uniquely yours.';
    let i = 0;
    setTimeout(() => {
      setIsGeneratingAI(false);
      const interval = setInterval(() => {
        setAiDescription((prev) => prev + text.charAt(i));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, 20);
    }, 1500);
  };
  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Products
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your inventory and product listings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" /> Bulk Upload CSV
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-9" />

            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Category
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Status
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-md w-16">
                    Image
                  </th>
                  <th className="px-4 py-3 font-medium">Product Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right rounded-tr-md">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockProducts.map((product) =>
                <tr
                  key={product.id}
                  className="hover:bg-muted/30 transition-colors group">

                    <td className="px-4 py-3">
                      <div
                      className={`h-10 w-10 rounded-md ${product.img} flex items-center justify-center border border-border`}>

                        <ImageIcon className="h-4 w-4 text-white/50" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {product.name}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 font-medium">{product.price}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      {product.status === 'Active' &&
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">
                          Active
                        </Badge>
                    }
                      {product.status === 'Low Stock' &&
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">
                          Low Stock
                        </Badge>
                    }
                      {product.status === 'Out of Stock' &&
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">
                          Out of Stock
                        </Badge>
                    }
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground">

                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive">

                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div>Showing 1 to 8 of 35 products</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Modal Overlay */}
      {isAddModalOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-border">
            <CardHeader className="sticky top-0 bg-card z-10 border-b border-border flex flex-row items-center justify-between">
              <CardTitle>Add New Product</CardTitle>
              <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAddModalOpen(false)}>

                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Images */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground">
                    Product Images
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      SVG, PNG, JPG or GIF
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="aspect-square rounded-md bg-muted border border-border"></div>
                    <div className="aspect-square rounded-md bg-muted border border-border"></div>
                    <div className="aspect-square rounded-md border-2 border-dashed border-border flex items-center justify-center text-muted-foreground cursor-pointer hover:bg-muted/50">
                      <Plus className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Right Column: Details */}
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Product Name
                    </label>
                    <Input placeholder="e.g. Premium Kikoy Fabric" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Price (KES)
                      </label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Compare at Price
                      </label>
                      <Input type="number" placeholder="0.00" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        SKU
                      </label>
                      <Input placeholder="PRD-001" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Inventory Count
                      </label>
                      <Input type="number" placeholder="0" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Category
                    </label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option>Clothing</option>
                      <option>Jewelry</option>
                      <option>Home Decor</option>
                      <option>Food & Beverage</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">
                        Description
                      </label>
                      <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                      onClick={handleGenerateAI}
                      disabled={isGeneratingAI}>

                        <Sparkles className="h-3 w-3 mr-1" />
                        {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                      </Button>
                    </div>
                    <textarea
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Describe your product..."
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)} />

                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <label className="text-sm font-medium text-foreground">
                      Variants (Optional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="px-3 py-1">
                        Size: S <X className="h-3 w-3 ml-1 cursor-pointer" />
                      </Badge>
                      <Badge variant="secondary" className="px-3 py-1">
                        Size: M <X className="h-3 w-3 ml-1 cursor-pointer" />
                      </Badge>
                      <Badge variant="secondary" className="px-3 py-1">
                        Size: L <X className="h-3 w-3 ml-1 cursor-pointer" />
                      </Badge>
                      <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs rounded-full">

                        <Plus className="h-3 w-3 mr-1" /> Add Variant
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end gap-3 rounded-b-lg">
              <Button
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}>

                Cancel
              </Button>
              <Button onClick={() => setIsAddModalOpen(false)}>
                Save Product
              </Button>
            </div>
          </Card>
        </div>
      }
    </div>);

}