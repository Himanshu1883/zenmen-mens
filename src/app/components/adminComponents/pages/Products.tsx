"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Plus, Trash2 } from "lucide-react";
import { GlassCard } from "../dashboard/GlassCard";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
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
          <p className="text-2xl font-semibold text-white">156</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">In Stock</p>
          <p className="text-2xl font-semibold text-green-400">142</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Low Stock</p>
          <p className="text-2xl font-semibold text-yellow-400">8</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Out of Stock</p>
          <p className="text-2xl font-semibold text-red-400">6</p>
        </GlassCard>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProducts.map((product) => (
          <GlassCard key={product.id} hover className="overflow-hidden">
            {/* Image */}
            <div className="aspect-square overflow-hidden relative group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
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
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    {product.name}
                  </h3>
                  <p className="text-[#C8A96E] text-sm">{product.category}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-white text-xl font-semibold">
                    ${product.price.toLocaleString()}
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
          disabled
        >
          Previous
        </Button>
        <Button
          size="sm"
          className="bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white"
        >
          1
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 text-gray-300"
        >
          2
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 text-gray-300"
        >
          3
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-white/10 text-gray-300"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
