"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { GlassCard } from "../dashboard/GlassCard";

interface Product {
  id?: string;
  _id?: string;
  name: string;
  title?: string;
  category: string;
  tagline?: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  images?: { url: string; alt?: string }[];
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Bespoke Three-Piece Suit",
    category: "Suits",
    price: 3500,
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop",
    status: "In Stock",
  },
  {
    id: "2",
    name: "Evening Gown Collection",
    category: "Dresses",
    price: 4200,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=400&fit=crop",
    status: "Low Stock",
  },
  {
    id: "3",
    name: "Custom Tailored Blazer",
    category: "Suits",
    price: 1800,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=400&fit=crop",
    status: "In Stock",
  },
  {
    id: "4",
    name: "Silk Wedding Dress",
    category: "Dresses",
    price: 5500,
    stock: 0,
    image:
      "https://images.unsplash.com/photo-1594638501279-1c2e8d0e7a9d?w=400&h=400&fit=crop",
    status: "Out of Stock",
  },
  {
    id: "5",
    name: "Premium Accessories Set",
    category: "Accessories",
    price: 650,
    stock: 24,
    image:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&h=400&fit=crop",
    status: "In Stock",
  },
  {
    id: "6",
    name: "Summer Linen Suit",
    category: "Suits",
    price: 2800,
    stock: 6,
    image:
      "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400&h=400&fit=crop",
    status: "In Stock",
  },
];

export default function Products() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [categories, setCategories] = useState<string[]>([]);

  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (selectedCategory && selectedCategory !== "All") {
          params.set("category", selectedCategory);
        }

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();

        console.log("API Response data:", data);

        // If API returns paginated shape use it, otherwise fall back to raw array
        if (data && Array.isArray(data.products)) {
          setProducts(data.products as Product[]);
          setPages(data.pages ?? 1);
          setTotal(data.total ?? 0);
        } else if (Array.isArray(data)) {
          setProducts(data as Product[]);
          setPages(1);
          setTotal(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };

    fetchProducts();
  }, [page, selectedCategory]);

  useEffect(() => {
    const unique = Array.from(
      new Set(products.map((p) => p.category).filter(Boolean)),
    );
    setCategories(unique);
  }, [products]);

  const getImageUrl = (p: Product) => {
    if (p.image) return p.image;
    if (p.images && p.images.length) return p.images[0].url;
    return "/placeholder.png";
  };

  const getImageAlt = (p: Product) => {
    if (p.images && p.images.length && p.images[0].alt) return p.images[0].alt;
    return p.name || "Product image";
  };

  const totalProducts = products.length;
  const inStock = products.filter((p) => p.status === "In Stock").length;
  const lowStock = products.filter((p) => p.status === "Low Stock").length;
  const outOfStock = products.filter((p) => p.status === "Out of Stock").length;

  const visibleProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-6 mt-16">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Products</h1>
          <p className="text-gray-400">Manage your luxury product catalog</p>
        </div>
        <Button className="bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Total Products</p>
          <p className="text-2xl font-semibold text-white">{totalProducts}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">In Stock</p>
          <p className="text-2xl font-semibold text-green-400">{inStock}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Low Stock</p>
          <p className="text-2xl font-semibold text-yellow-400">{lowStock}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Out of Stock</p>
          <p className="text-2xl font-semibold text-red-400">{outOfStock}</p>
        </GlassCard>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
            selectedCategory === "All"
              ? "bg-[#C8A96E] text-[#050a18] border-transparent"
              : "text-gray-300 border-white/10"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
              selectedCategory === cat
                ? "bg-[#C8A96E] text-[#050a18] border-transparent"
                : "text-gray-300 border-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleProducts.map((product) => (
          <GlassCard
            key={product._id ?? product.id}
            hover
            className="overflow-hidden"
          >
            {/* Image */}
            <div className="aspect-square overflow-hidden relative group">
              <Image
                src={getImageUrl(product)}
                alt={getImageAlt(product)}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-[#C8A96E] hover:bg-white/10"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <Badge
                  variant="outline"
                  className={
                    product.status === "In Stock"
                      ? "border-green-500/50 text-green-400 bg-green-500/20"
                      : product.status === "Low Stock"
                        ? "border-yellow-500/50 text-yellow-400 bg-yellow-500/20"
                        : "border-red-500/50 text-red-400 bg-red-500/20"
                  }
                >
                  {product.status}
                </Badge>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1 line-clamp-2">
                    {product.title || product.name}
                  </h3>
                  {product.tagline && (
                    <p className="text-gray-400 text-xs mb-1 line-clamp-1">
                      {product.tagline}
                    </p>
                  )}
                  <p className="text-[#C8A96E] text-sm">{product.category}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-white text-xl font-semibold">
                    ₹{product.price.toLocaleString()}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Stock: {product.stock}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-[#C8A96E] hover:bg-white/5"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-white/5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 text-gray-300"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Previous
        </Button>

        {Array.from({ length: pages }).map((_, i) => (
          <Button
            key={i}
            size="sm"
            onClick={() => setPage(i + 1)}
            className={
              page === i + 1
                ? "bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white"
                : "border-white/10 text-gray-300"
            }
          >
            {i + 1}
          </Button>
        ))}

        <Button
          size="sm"
          variant="outline"
          className="border-white/10 text-gray-300"
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page >= pages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
