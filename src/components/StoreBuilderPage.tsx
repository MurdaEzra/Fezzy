import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import {
  LayoutTemplate,
  Image as ImageIcon,
  Type,
  Palette,
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Check,
  Monitor,
  Smartphone,
  Globe,
  ArrowLeft,
  Plus,
  Star } from
'lucide-react';
const storeProducts = [
{
  name: 'Premium Kikoy Fabric',
  price: 'KES 1,500',
  color: 'bg-orange-200'
},
{
  name: 'Handmade Maasai Necklace',
  price: 'KES 2,200',
  color: 'bg-red-200'
},
{
  name: 'Kenyan AA Coffee Beans (500g)',
  price: 'KES 1,800',
  color: 'bg-amber-800'
},
{
  name: 'Carved Wooden Elephant',
  price: 'KES 4,500',
  color: 'bg-stone-300'
},
{
  name: 'Kitenge Print Dress',
  price: 'KES 3,500',
  color: 'bg-purple-300'
},
{
  name: 'Leather Sandals (Akala)',
  price: 'KES 1,200',
  color: 'bg-amber-600'
}];

export function StoreBuilderPage({
  navigate


}: {navigate?: (page: any) => void;}) {
  const [activeTab, setActiveTab] = useState('sections');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>(
    'desktop'
  );
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isLiveView, setIsLiveView] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [sections, setSections] = useState([
  {
    id: 'hero',
    name: 'Hero Banner',
    visible: true,
    type: 'hero'
  },
  {
    id: 'products',
    name: 'Featured Products',
    visible: true,
    type: 'products'
  },
  {
    id: 'about',
    name: 'About Us',
    visible: true,
    type: 'text'
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    visible: true,
    type: 'testimonials'
  },
  {
    id: 'contact',
    name: 'Contact Form',
    visible: true,
    type: 'contact'
  }]
  );
  const [sectionContent, setSectionContent] = useState({
    hero: {
      title: 'Fresh Groceries Delivered',
      subtitle:
      'Get the freshest farm produce delivered straight to your doorstep in Nairobi.',
      cta: 'Shop Now',
      bgStyle: 'muted'
    },
    products: {
      title: 'Featured Products',
      count: 3
    },
    about: {
      title: 'Our Story',
      body: 'We started Mama Mboga to connect local farmers directly with urban consumers, ensuring fair prices and fresh produce every single day.'
    },
    testimonials: {
      title: 'What Our Customers Say',
      show: true
    },
    contact: {
      title: 'Get in Touch',
      emailPlaceholder: 'Your Email',
      showPhone: false
    }
  });
  const [theme, setTheme] = useState({
    font: 'Inter',
    primaryColor: '#0f172a',
    logo: null as string | null
  });
  const toggleVisibility = (id: string) => {
    setSections(
      sections.map((s) =>
      s.id === id ?
      {
        ...s,
        visible: !s.visible
      } :
      s
      )
    );
  };
  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };
  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
    }, 2000);
  };
  const handleContentChange = (
  sectionId: string,
  field: string,
  value: any) =>
  {
    setSectionContent((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId as keyof typeof prev],
        [field]: value
      }
    }));
  };
  const addSection = (type: string, name: string) => {
    const newId = `${type}-${Date.now()}`;
    setSections([
    ...sections,
    {
      id: newId,
      name,
      visible: true,
      type
    }]
    );
    // Initialize default content for new sections
    setSectionContent((prev) => ({
      ...prev,
      [newId]: {
        title: `New ${name}`,
        ...(type === 'hero' ?
        {
          subtitle: 'Subtitle text',
          cta: 'Click Here',
          bgStyle: 'muted'
        } :
        {}),
        ...(type === 'products' ?
        {
          count: 3
        } :
        {}),
        ...(type === 'text' ?
        {
          body: 'Text content goes here.'
        } :
        {}),
        ...(type === 'testimonials' ?
        {
          show: true
        } :
        {}),
        ...(type === 'contact' ?
        {
          emailPlaceholder: 'Your Email',
          showPhone: false
        } :
        {})
      }
    }));
    setShowAddSection(false);
  };
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTheme((prev) => ({
          ...prev,
          logo: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const renderStoreContent = (isFullWidth = false) =>
  <div
    className={`bg-background shadow-2xl border border-border transition-all duration-300 origin-top overflow-hidden relative
      ${!isFullWidth && previewMode === 'mobile' ? 'w-[375px] rounded-[2rem] border-8 border-gray-900 h-[812px] mx-auto' : 'w-full max-w-5xl rounded-lg min-h-full mx-auto'}
      ${isFullWidth ? 'h-full w-full max-w-none rounded-none border-none' : ''}
    `}>

      {/* Mock Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 bg-background/90 backdrop-blur z-10">
        <div
        className="font-bold text-xl flex items-center gap-2"
        style={{
          color: theme.primaryColor
        }}>

          {theme.logo &&
        <img
          src={theme.logo}
          alt="Brand Logo"
          className="h-8 w-auto object-contain" />

        }
          {!theme.logo && 'Mama Mboga'}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-4 text-sm font-medium text-muted-foreground">
            <span>Home</span>
            <span>Shop</span>
            <span>About</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs">🛒</span>
          </div>
        </div>
      </header>

      <div
      className={`overflow-y-auto pb-20 ${isFullWidth ? 'h-[calc(100vh-4rem)]' : 'h-full'}`}>

        {sections.map((section) => {
        if (!section.visible) return null;
        const content =
        sectionContent[section.id as keyof typeof sectionContent] ||
        sectionContent[section.type as keyof typeof sectionContent];
        switch (section.type) {
          case 'hero':
            return (
              <div
                key={section.id}
                className={`relative py-24 px-6 text-center border-b border-border group ${content.bgStyle === 'muted' ? 'bg-muted/30' : content.bgStyle === 'primary' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>

                  {!isFullWidth &&
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={() => setEditingSection(section.id)}>

                        <Edit2 className="h-3 w-3 mr-1" /> Edit Hero
                      </Button>
                    </div>
                }
                  <h2
                  className={`text-4xl sm:text-5xl font-bold mb-4 ${content.bgStyle === 'primary' ? 'text-primary-foreground' : 'text-foreground'}`}>

                    {content.title}
                  </h2>
                  <p
                  className={`text-lg mb-8 max-w-xl mx-auto ${content.bgStyle === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>

                    {content.subtitle}
                  </p>
                  <Button
                  style={
                  content.bgStyle !== 'primary' ?
                  {
                    backgroundColor: theme.primaryColor,
                    color: 'white'
                  } :
                  {
                    backgroundColor: 'white',
                    color: theme.primaryColor
                  }
                  }>

                    {content.cta}
                  </Button>
                </div>);

          case 'products':
            return (
              <div
                key={section.id}
                className="py-16 px-6 border-b border-border group relative">

                  {!isFullWidth &&
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={() => setEditingSection(section.id)}>

                        <Edit2 className="h-3 w-3 mr-1" /> Edit Grid
                      </Button>
                    </div>
                }
                  <h3 className="text-2xl font-bold mb-8 text-center text-foreground">
                    {content.title}
                  </h3>
                  <div
                  className={`grid gap-6 ${!isFullWidth && previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>

                    {storeProducts.slice(0, content.count).map((product, i) =>
                  <div key={i} className="group/card cursor-pointer">
                        <div
                      className={`aspect-square rounded-lg mb-3 border border-border ${product.color}`}>
                    </div>
                        <h4 className="font-medium text-foreground">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {product.price}
                        </p>
                        <Button
                      variant="outline"
                      className="w-full text-xs h-8">

                          Add to Cart
                        </Button>
                      </div>
                  )}
                  </div>
                </div>);

          case 'text':
            return (
              <div
                key={section.id}
                className="py-16 px-6 text-center border-b border-border group relative">

                  {!isFullWidth &&
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={() => setEditingSection(section.id)}>

                        <Edit2 className="h-3 w-3 mr-1" /> Edit Text
                      </Button>
                    </div>
                }
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {content.title}
                  </h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {content.body}
                  </p>
                </div>);

          case 'testimonials':
            if (!content.show) return null;
            return (
              <div
                key={section.id}
                className="py-16 px-6 border-b border-border group relative bg-muted/10">

                  {!isFullWidth &&
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={() => setEditingSection(section.id)}>

                        <Edit2 className="h-3 w-3 mr-1" /> Edit Testimonials
                      </Button>
                    </div>
                }
                  <h3 className="text-2xl font-bold mb-8 text-center text-foreground">
                    {content.title}
                  </h3>
                  <div
                  className={`grid gap-6 ${!isFullWidth && previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>

                    <Card className="bg-background">
                      <CardContent className="pt-6">
                        <div className="flex gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((star) =>
                        <Star
                          key={star}
                          className="h-4 w-4 fill-amber-400 text-amber-400" />

                        )}
                        </div>
                        <p className="text-muted-foreground italic mb-6">
                          "The freshest produce I've ever bought online.
                          Delivery was fast and the quality is unmatched."
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            J
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              Jane Doe
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Nairobi
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-background">
                      <CardContent className="pt-6">
                        <div className="flex gap-1 mb-4">
                          {[1, 2, 3, 4, 5].map((star) =>
                        <Star
                          key={star}
                          className="h-4 w-4 fill-amber-400 text-amber-400" />

                        )}
                        </div>
                        <p className="text-muted-foreground italic mb-6">
                          "Mama Mboga has completely changed how I shop for
                          groceries. Highly recommended!"
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            K
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              Kevin M.
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Westlands
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>);

          case 'contact':
            return (
              <div
                key={section.id}
                className="py-16 px-6 border-b border-border group relative bg-muted/10">

                  {!isFullWidth &&
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={() => setEditingSection(section.id)}>

                        <Edit2 className="h-3 w-3 mr-1" /> Edit Contact
                      </Button>
                    </div>
                }
                  <div className="max-w-md mx-auto">
                    <h3 className="text-2xl font-bold mb-6 text-center text-foreground">
                      {content.title}
                    </h3>
                    <div className="space-y-4">
                      <Input
                      placeholder="Your Name"
                      className="bg-background" />

                      <Input
                      placeholder={content.emailPlaceholder}
                      className="bg-background" />

                      {content.showPhone &&
                    <Input
                      placeholder="Your Phone Number"
                      className="bg-background" />

                    }
                      <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Message">
                    </textarea>
                      <Button
                      className="w-full"
                      style={{
                        backgroundColor: theme.primaryColor,
                        color: 'white'
                      }}>

                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>);

          default:
            return null;
        }
      })}

        {/* Mock Footer */}
        <footer className="py-8 px-6 text-center text-sm text-muted-foreground bg-card">
          <p>© 2023 Mama Mboga. Powered by FEZZY.</p>
        </footer>
      </div>
    </div>;

  return (
    <>
      <div className="h-[calc(100vh-8rem)] flex flex-col -m-4 lg:-m-8">
        {/* Builder Header */}
        <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-foreground flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4 text-primary" /> Store Builder
            </h1>
            <div className="hidden sm:flex items-center bg-muted rounded-md p-1">
              <button
                className={`p-1.5 rounded-sm transition-colors ${previewMode === 'desktop' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setPreviewMode('desktop')}>

                <Monitor className="h-4 w-4" />
              </button>
              <button
                className={`p-1.5 rounded-sm transition-colors ${previewMode === 'mobile' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setPreviewMode('mobile')}>

                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className={previewMode === 'mobile' ? 'flex' : 'hidden sm:flex'}
              onClick={() => navigate && navigate('live-store')}>

              <Globe className="mr-2 h-4 w-4" /> View Live
            </Button>
            <Button
              size="sm"
              onClick={handlePublish}
              className={
              isPublishing ?
              'bg-emerald-600 hover:bg-emerald-700 text-white' :
              ''
              }>

              {isPublishing ? '✓ Published!' : 'Publish Changes'}
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Controls */}
          <div className="w-80 border-r border-border bg-card flex flex-col shrink-0 overflow-y-auto">
            {editingSection ?
            <div className="p-4 flex flex-col h-full">
                <Button
                variant="ghost"
                size="sm"
                className="mb-4 self-start text-muted-foreground"
                onClick={() => setEditingSection(null)}>

                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sections
                </Button>
                <h3 className="text-lg font-semibold mb-4 text-foreground capitalize">
                  Edit {sections.find((s) => s.id === editingSection)?.name}
                </h3>

                <div className="space-y-4 flex-1">
                  {sections.find((s) => s.id === editingSection)?.type ===
                'hero' &&
                <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      title || ''
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'title',
                        e.target.value
                      )
                      } />

                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Subtitle</label>
                        <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      subtitle || ''
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'subtitle',
                        e.target.value
                      )
                      } />

                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">CTA Text</label>
                        <Input
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      cta || ''
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'cta',
                        e.target.value
                      )
                      } />

                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Background Style
                        </label>
                        <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      bgStyle || 'muted'
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'bgStyle',
                        e.target.value
                      )
                      }>

                          <option value="muted">Muted</option>
                          <option value="white">White</option>
                          <option value="primary">Primary Color</option>
                        </select>
                      </div>
                    </>
                }
                  {sections.find((s) => s.id === editingSection)?.type ===
                'products' &&
                <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Section Title
                        </label>
                        <Input
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      title || ''
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'title',
                        e.target.value
                      )
                      } />

                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Number of Products to Show
                        </label>
                        <Input
                      type="number"
                      min="1"
                      max="6"
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      count || 3
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'count',
                        parseInt(e.target.value)
                      )
                      } />

                      </div>
                    </>
                }
                  {sections.find((s) => s.id === editingSection)?.type ===
                'text' &&
                <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      title || ''
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'title',
                        e.target.value
                      )
                      } />

                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Body Text</label>
                        <textarea
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      body || ''
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'body',
                        e.target.value
                      )
                      } />

                      </div>
                    </>
                }
                  {sections.find((s) => s.id === editingSection)?.type ===
                'testimonials' &&
                <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Section Title
                        </label>
                        <Input
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      title || ''
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'title',
                        e.target.value
                      )
                      } />

                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <label className="text-sm font-medium">
                          Show Testimonials
                        </label>
                        <input
                      type="checkbox"
                      checked={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      show !== false
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'show',
                        e.target.checked
                      )
                      }
                      className="h-4 w-4" />

                      </div>
                    </>
                }
                  {sections.find((s) => s.id === editingSection)?.type ===
                'contact' &&
                <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Section Title
                        </label>
                        <Input
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      title || ''
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'title',
                        e.target.value
                      )
                      } />

                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Email Placeholder
                        </label>
                        <Input
                      value={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      emailPlaceholder || ''
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'emailPlaceholder',
                        e.target.value
                      )
                      } />

                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <label className="text-sm font-medium">
                          Show Phone Field
                        </label>
                        <input
                      type="checkbox"
                      checked={
                      sectionContent[
                      editingSection as keyof typeof sectionContent]?.
                      showPhone === true
                      }
                      onChange={(e) =>
                      handleContentChange(
                        editingSection,
                        'showPhone',
                        e.target.checked
                      )
                      }
                      className="h-4 w-4" />

                      </div>
                    </>
                }
                </div>
              </div> :

            <>
                <div className="flex border-b border-border">
                  <button
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'sections' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('sections')}>

                    Sections
                  </button>
                  <button
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'theme' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setActiveTab('theme')}>

                    Theme Settings
                  </button>
                </div>

                <div className="p-4 flex-1">
                  {activeTab === 'sections' ?
                <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-foreground">
                          Homepage Layout
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {sections.map((section) =>
                    <Card
                      key={section.id}
                      className={`border-border/50 shadow-sm transition-opacity ${!section.visible ? 'opacity-50 bg-muted/30' : 'bg-background'}`}>

                            <CardContent className="p-3 flex items-center gap-3">
                              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              <div className="flex-1 text-sm font-medium text-foreground">
                                {section.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                            onClick={() => toggleVisibility(section.id)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">

                                  {section.visible ?
                            <Eye className="h-4 w-4" /> :

                            <EyeOff className="h-4 w-4" />
                            }
                                </button>
                                <button
                            onClick={() => setEditingSection(section.id)}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">

                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                            onClick={() => deleteSection(section.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-colors">

                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </CardContent>
                          </Card>
                    )}
                      </div>

                      {showAddSection ?
                  <Card className="p-2 space-y-1">
                          <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => addSection('hero', 'Hero Banner')}>

                            Hero Banner
                          </Button>
                          <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() =>
                      addSection('products', 'Product Grid')
                      }>

                            Product Grid
                          </Button>
                          <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => addSection('text', 'Text Section')}>

                            Text Section
                          </Button>
                          <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() =>
                      addSection('testimonials', 'Testimonials')
                      }>

                            Testimonials
                          </Button>
                          <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() =>
                      addSection('contact', 'Contact Form')
                      }>

                            Contact Form
                          </Button>
                          <Button
                      variant="ghost"
                      className="w-full justify-center text-sm h-8 text-muted-foreground mt-2"
                      onClick={() => setShowAddSection(false)}>

                            Cancel
                          </Button>
                        </Card> :

                  <Button
                    variant="outline"
                    className="w-full mt-4 border-dashed"
                    onClick={() => setShowAddSection(true)}>

                          <Plus className="h-4 w-4 mr-2" /> Add Section
                        </Button>
                  }
                    </div> :

                <div className="space-y-6">
                      {/* Logo */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" /> Brand Logo
                        </h3>
                        <label className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer bg-background relative overflow-hidden">
                          <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload} />

                          {theme.logo ?
                      <img
                        src={theme.logo}
                        alt="Uploaded Logo"
                        className="h-16 w-auto object-contain mb-2" /> :


                      <ImageIcon className="h-6 w-6 text-muted-foreground mb-2" />
                      }
                          <p className="text-sm font-medium">
                            {theme.logo ? 'Change Logo' : 'Upload Logo'}
                          </p>
                        </label>
                      </div>

                      {/* Colors */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Palette className="h-4 w-4" /> Brand Colors
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                          {[
                      '#0f172a',
                      '#2563eb',
                      '#16a34a',
                      '#dc2626',
                      '#d97706'].
                      map((color) =>
                      <button
                        key={color}
                        className="w-full aspect-square rounded-md border border-border/50 flex items-center justify-center transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color
                        }}
                        onClick={() =>
                        setTheme({
                          ...theme,
                          primaryColor: color
                        })
                        }>

                              {theme.primaryColor === color &&
                        <Check className="h-4 w-4 text-white drop-shadow-md" />
                        }
                            </button>
                      )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div
                        className="w-8 h-8 rounded-md border border-border"
                        style={{
                          backgroundColor: theme.primaryColor
                        }}>
                      </div>
                          <Input
                        value={theme.primaryColor}
                        className="h-8 text-xs font-mono"
                        readOnly />

                        </div>
                      </div>

                      {/* Typography */}
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Type className="h-4 w-4" /> Typography
                        </h3>
                        <div className="space-y-2">
                          <label className="text-xs text-muted-foreground">
                            Heading Font
                          </label>
                          <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <option>Inter</option>
                            <option>Playfair Display</option>
                            <option>Montserrat</option>
                          </select>
                        </div>
                      </div>
                    </div>
                }
                </div>
              </>
            }
          </div>

          {/* Right Panel: Live Preview */}
          <div className="flex-1 bg-muted/30 p-4 md:p-8 overflow-y-auto flex justify-center">
            {renderStoreContent()}
          </div>
        </div>
      </div>

      {/* Live View Overlay */}
      {isLiveView &&
      <div className="fixed inset-0 z-[60] bg-background flex flex-col">
          <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between shrink-0">
            <div className="font-medium text-sm text-muted-foreground">
              Live Preview Mode
            </div>
            <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLiveView(false)}>

              <X className="h-4 w-4 mr-2" /> Close Preview
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto bg-muted/10">
            {renderStoreContent(true)}
          </div>
        </div>
      }
    </>);

}