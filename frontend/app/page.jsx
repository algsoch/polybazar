import Link from 'next/link';
import { ArrowRightIcon, SparklesIcon, ShieldCheckIcon, ChartBarIcon, CubeIcon } from '@heroicons/react/24/outline';

// Server-side rendering for SEO
export const revalidate = 3600; // Revalidate every hour

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/v1/products?featured=true&size=4`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  } catch {
    // Return mock data for demo
    return {
      content: [
        { id: '1', name: 'HDPE Granules - Virgin', grade: 'A', pricePerKg: 85, location: 'Mumbai', images: [], verified: true, co2Saved: 12 },
        { id: '2', name: 'PP Recycled Pellets', grade: 'B+', pricePerKg: 62, location: 'Delhi', images: [], verified: true, co2Saved: 18 },
        { id: '3', name: 'PET Flakes - Clear', grade: 'A', pricePerKg: 45, location: 'Chennai', images: [], verified: false, co2Saved: 25 },
        { id: '4', name: 'LDPE Film Grade', grade: 'B', pricePerKg: 55, location: 'Bangalore', images: [], verified: true, co2Saved: 15 },
      ],
    };
  }
}

async function getStats() {
  return {
    totalProducts: '12,450+',
    activeSellers: '2,800+',
    tradedVolume: '45K MT',
    co2Saved: '8.2K tons',
  };
}

export default async function HomePage() {
  const [featuredProducts, stats] = await Promise.all([
    getFeaturedProducts(),
    getStats(),
  ]);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20 lg:py-28">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-small font-medium">
                <SparklesIcon className="w-4 h-4" />
                AI-Powered Polymer Trading
              </div>
              
              <h1 className="text-h1 lg:text-display text-gray-900 leading-tight">
                PolyBazar — <span className="text-gradient">AI Intelligence</span> for Polymer Trade
              </h1>
              
              <p className="text-body text-neutral-muted max-w-xl">
                India's first AI-powered B2B marketplace connecting polymer granule manufacturers, 
                recyclers, and buyers with intelligent pricing, visual classification, and 
                real-time negotiation.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/products" className="btn-primary group">
                  Browse Products
                  <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/sell" className="btn-secondary">
                  List Granules
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-tiny text-primary font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-small text-neutral-muted">
                  <strong className="text-gray-900">2,800+</strong> verified sellers
                </p>
              </div>
            </div>
            
            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative z-10 bg-white rounded-2xl shadow-card-hover p-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="grid grid-cols-2 gap-4">
                  {featuredProducts.content?.slice(0, 2).map((product) => (
                    <div key={product.id} className="bg-neutral-bg rounded-card p-4">
                      <div className="h-24 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg mb-3" />
                      <p className="font-semibold text-small truncate">{product.name}</p>
                      <p className="text-primary font-bold">₹{product.pricePerKg}/kg</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-accent text-white px-4 py-2 rounded-lg shadow-lg transform rotate-3 animate-pulse-slow">
                <p className="font-bold">AI Verified ✓</p>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white px-4 py-3 rounded-lg shadow-lg">
                <p className="text-tiny text-neutral-muted">CO₂ Saved</p>
                <p className="font-bold text-accent text-h4">8.2K tons</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-neutral-border py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Listed Products', value: stats.totalProducts, icon: CubeIcon },
              { label: 'Active Sellers', value: stats.activeSellers, icon: ShieldCheckIcon },
              { label: 'Traded Volume', value: stats.tradedVolume, icon: ChartBarIcon },
              { label: 'CO₂ Saved', value: stats.co2Saved, icon: SparklesIcon },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-h3 font-bold text-gray-900">{stat.value}</p>
                <p className="text-small text-neutral-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-neutral-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-h2 text-gray-900 mb-4">How PolyBazar Works</h2>
            <p className="text-body text-neutral-muted max-w-2xl mx-auto">
              From listing to delivery, our AI-powered platform streamlines every step of polymer trading
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'List Your Material',
                description: 'Upload images and our AI automatically classifies polymer type, quality grade, and suggests optimal pricing.',
                icon: '📦',
              },
              {
                step: '02',
                title: 'AI-Powered Matching',
                description: 'Our recommendation engine connects your listing with verified buyers looking for exactly what you offer.',
                icon: '🤖',
              },
              {
                step: '03',
                title: 'Negotiate & Trade',
                description: 'Use real-time chat with AI-assisted negotiation. Secure payments and automated invoice generation.',
                icon: '🤝',
              },
            ].map((item) => (
              <div key={item.step} className="card p-8 text-center group hover:-translate-y-1 transition-transform">
                <div className="text-4xl mb-4">{item.icon}</div>
                <div className="text-primary font-bold text-small mb-2">Step {item.step}</div>
                <h3 className="text-h4 text-gray-900 mb-3">{item.title}</h3>
                <p className="text-body text-neutral-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-h2 text-gray-900 mb-2">Featured Products</h2>
              <p className="text-body text-neutral-muted">AI-verified listings with best quality ratings</p>
            </div>
            <Link href="/products" className="btn-secondary hidden md:flex">
              View All
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.content?.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="card group overflow-hidden">
                <div className="relative h-48 bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
                  <span className="text-5xl">📦</span>
                  {product.verified && (
                    <div className="absolute top-3 left-3 badge-accent">
                      <ShieldCheckIcon className="w-3 h-3 mr-1" />
                      Verified
                    </div>
                  )}
                  <div className="absolute top-3 right-3 badge-primary">
                    Grade {product.grade}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-h4 text-primary font-bold">₹{product.pricePerKg}/kg</span>
                    <span className="text-tiny text-neutral-muted">{product.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-accent text-tiny">
                      <SparklesIcon className="w-3 h-3" />
                      {product.co2Saved} kg CO₂ saved
                    </div>
                    <span className="text-primary text-small font-medium">
                      View →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link href="/products" className="btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-700">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-h2 text-white mb-4">Ready to Transform Your Polymer Business?</h2>
          <p className="text-body text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of verified sellers and buyers on India's most trusted polymer trading platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/sell" className="bg-white text-primary font-semibold px-6 py-3 rounded-button shadow-lg hover:shadow-xl transition-shadow">
              List Waste (Earn)
            </Link>
            <Link href="/products" className="border-2 border-white text-white font-semibold px-6 py-3 rounded-button hover:bg-white/10 transition-colors">
              Request Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
