"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Edit, Eye, Trash2, Upload, XCircle } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "../dashboard/GlassCard";
// import { CreateCollectionModal } from "../components/modals/CreateCollectionModal";

interface ImageItem {
  id: string;
  section: string;
  page: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  description: string[];
  price?: number;
  category?: string;
  occasion?: string[];
  imageUrl: string;
  images?: {
    front?: string;
    back?: string;
  };
  details?: {
    fabric?: string;
    type?: string;
    embellishment?: string[];
    neckline?: string;
    closure?: string;
    size?: string;
    color?: string;
    style?: string;
    washCare?: string;
  };
  includes?: string;
  disclaimer?: string;
  manufacturing?: {
    country?: string;
    manufacturer?: string;
    packedBy?: string;
    address?: string;
  };
  contact?: {
    phone?: string;
    note?: string;
  };
  orientation?: string;
  featured?: boolean;
  status: boolean;
}

const mockData: Record<string, ImageItem[]> = {
  "Home Page": [
    {
      id: "1",
      section: "Hero Banner",
      page: "Home Page",
      title: "ZENmen Executive Collection",
      description: ["Experience precision tailoring for the modern gentleman"],
      imageUrl:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
      status: true,
    },
    {
      id: "2",
      section: "Featured Section",
      page: "Home Page",
      title: "Bespoke Tailoring",
      description: ["Custom designs tailored to perfection"],
      imageUrl:
        "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&h=600&fit=crop",
      status: true,
    },
  ],
  "About Page": [
    {
      id: "3",
      section: "Our Story",
      page: "About Page",
      title: "Craftsmanship Since 1985",
      description: ["Three decades of excellence in couture"],
      imageUrl:
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=600&fit=crop",
      status: true,
    },
  ],
  "Collections Page": [
    {
      id: "4",
      section: "Spring Collection",
      page: "Collections Page",
      title: "Spring 2026 Collection",
      description: ["Elegant designs for the new season"],
      price: 2500,
      imageUrl:
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop",
      status: true,
    },
    {
      id: "5",
      section: "Summer Collection",
      page: "Collections Page",
      title: "Summer Elegance",
      description: ["Light fabrics for warm sophistication"],
      price: 2800,
      imageUrl:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop",
      status: true,
    },
  ],
  "Custom Design Page": [
    {
      id: "6",
      section: "Design Process",
      page: "Custom Design Page",
      title: "Your Vision, Our Craft",
      description: ["Create your dream couture piece"],
      imageUrl:
        "https://images.unsplash.com/photo-1558769132-cb1aea00f4cf?w=800&h=600&fit=crop",
      status: true,
    },
  ],
  "Measurement Page": [
    {
      id: "7",
      section: "Precision Fitting",
      page: "Measurement Page",
      title: "Perfect Fit Guarantee",
      description: ["Expert measurements for flawless results"],
      imageUrl:
        "https://images.unsplash.com/photo-1445384763658-0400939829cd?w=800&h=600&fit=crop",
      status: true,
    },
  ],
  "Embroidery Page": [
    {
      id: "8",
      section: "Artisan Details",
      page: "Embroidery Page",
      title: "Handcrafted Embroidery",
      description: ["Intricate details by master artisans"],
      imageUrl:
        "https://images.unsplash.com/photo-1610652492500-ded49c48c665?w=800&h=600&fit=crop",
      status: true,
    },
  ],
  "Contact Page": [
    {
      id: "9",
      section: "Location",
      page: "Contact Page",
      title: "Visit Our Atelier",
      description: ["Schedule your consultation today"],
      imageUrl:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop",
      status: true,
    },
  ],
};

export default function ImageManagement() {
  const [editingItem, setEditingItem] = useState<ImageItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"before" | "after">("before");
  const [formData, setFormData] = useState<ImageItem | null>(null);

  const handleEdit = (item: ImageItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setPreviewMode("before");
  };

  const handleSave = () => {
    // Save logic would go here
    setEditingItem(null);
    setFormData(null);
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSave = (data: Partial<ImageItem>) => {
    // Create new collection logic would go here
    console.log("✨ Creating new premium collection:", data);
    // In a real application, you would:
    // 1. Send data to API endpoint
    // 2. Update local state/cache
    // 3. Show success notification
    // 4. Refresh the collection list
    // 5. Navigate to the new item

    // For now, just log and close
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 mt-16">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#0f172a] mb-2">
            Website Image Management
          </h1>
          <p className="text-[#64748b]">
            Manage all images across your website pages
          </p>
        </div>
        <Button
          className="bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
          onClick={handleCreateNew}
        >
          <Upload className="w-4 h-4 mr-2" />
          Add New Image
        </Button>
      </div>

      {/* Accordion Sections */}
      <GlassCard className="p-6">
        <Accordion type="multiple" className="space-y-4">
          {Object.entries(mockData).map(([pageName, items]) => (
            <AccordionItem
              key={pageName}
              value={pageName}
              className="border-[#e2e8f0] rounded-xl overflow-hidden"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-[#f1f5f9] hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="text-lg font-medium text-[#0f172a]">
                    {pageName}
                  </span>
                  <span className="text-sm text-[#64748b]">
                    {items.length} images
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-[#e2e8f0] overflow-hidden bg-black/20 hover:border-[#7da8c7]/30 transition-all"
                    >
                      {/* Image Preview */}
                      <div className="aspect-video overflow-hidden relative group">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#0f172a] hover:text-[#7da8c7] hover:bg-[#f0f6fb]"
                            onClick={() => handleEdit(item)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-[#0f172a] font-medium text-sm">
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {item.status ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        </div>
                        <p className="text-[#64748b] text-xs mb-3 line-clamp-2">
                          {item.description.join(" ")}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[#7da8c7] text-xs">
                              {item.section}
                            </span>
                            {item.price && (
                              <span className="text-[#94a3b8] text-xs">
                                ${item.price}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-[#64748b] hover:text-[#7da8c7] hover:bg-[#f1f5f9]"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-[#64748b] hover:text-red-400 hover:bg-[#f1f5f9]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </GlassCard>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-[100vw] w-[100vw] max-h-[90vh] overflow-y-auto bg-[#081122] border-[#e2e8f0]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-[#0f172a]">
              Edit Collection Item
            </DialogTitle>
            <DialogDescription className="text-[#64748b]">
              Update collection details, product information, and images
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Left Column - Basic Info & Images */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#0f172a] border-b border-[#e2e8f0] pb-2">
                  Basic Information
                </h3>

                <div>
                  <Label className="text-[#64748b] mb-2">Title *</Label>
                  <Input
                    value={formData?.title || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev ? { ...prev, title: e.target.value } : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Subtitle</Label>
                  <Input
                    value={formData?.subtitle || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              subtitle: e.target.value,
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Tagline</Label>
                  <Input
                    value={formData?.tagline || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev ? { ...prev, tagline: e.target.value } : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">
                    Description Paragraphs
                  </Label>
                  <Textarea
                    value={formData?.description?.join("\n\n") || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              description: e.target.value
                                .split("\n\n")
                                .filter((p) => p.trim()),
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] min-h-[120px]"
                    placeholder="Separate paragraphs with double line breaks"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#64748b] mb-2">Price</Label>
                    <Input
                      type="number"
                      value={formData?.price || ""}
                      onChange={(e) =>
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                price: Number(e.target.value),
                              }
                            : null,
                        )
                      }
                      className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                    />
                  </div>

                  <div>
                    <Label className="text-[#64748b] mb-2">Category</Label>
                    <Input
                      value={formData?.category || ""}
                      onChange={(e) =>
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                category: e.target.value,
                              }
                            : null,
                        )
                      }
                      className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">
                    Occasions (comma separated)
                  </Label>
                  <Input
                    value={formData?.occasion?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              occasion: e.target.value
                                .split(",")
                                .map((o) => o.trim())
                                .filter((o) => o),
                            }
                          : null,
                      )
                    }
                    placeholder="Wedding, Party, Formal"
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Orientation</Label>
                  <Select
                    value={formData?.orientation || ""}
                    onValueChange={(value: string) =>
                      setFormData((prev) =>
                        prev ? { ...prev, orientation: value } : null,
                      )
                    }
                  >
                    <SelectTrigger className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]">
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#081122] border-[#e2e8f0]">
                      <SelectItem value="portrait" className="text-[#0f172a]">
                        Portrait
                      </SelectItem>
                      <SelectItem value="landscape" className="text-[#0f172a]">
                        Landscape
                      </SelectItem>
                      <SelectItem value="square" className="text-[#0f172a]">
                        Square
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc]">
                  <Label className="text-[#64748b]">Featured</Label>
                  <Switch
                    checked={formData?.featured || false}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev) =>
                        prev ? { ...prev, featured: checked } : null,
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#f8fafc]">
                  <Label className="text-[#64748b]">Active Status</Label>
                  <Switch
                    checked={formData?.status || false}
                    onCheckedChange={(checked: boolean) =>
                      setFormData((prev) =>
                        prev ? { ...prev, status: checked } : null,
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#0f172a] border-b border-[#e2e8f0] pb-2">
                  Images
                </h3>

                <div>
                  <Label className="text-[#64748b] mb-2">Main Image</Label>
                  <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-6 text-center hover:border-[#7da8c7]/50 transition-colors cursor-pointer">
                    <Upload className="w-6 h-6 text-[#64748b] mx-auto mb-2" />
                    <p className="text-sm text-[#64748b]">Upload main image</p>
                  </div>
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Front Image</Label>
                  <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-6 text-center hover:border-[#7da8c7]/50 transition-colors cursor-pointer">
                    <Upload className="w-6 h-6 text-[#64748b] mx-auto mb-2" />
                    <p className="text-sm text-[#64748b]">Upload front view</p>
                  </div>
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Back Image</Label>
                  <div className="border-2 border-dashed border-[#e2e8f0] rounded-xl p-6 text-center hover:border-[#7da8c7]/50 transition-colors cursor-pointer">
                    <Upload className="w-6 h-6 text-[#64748b] mx-auto mb-2" />
                    <p className="text-sm text-[#64748b]">Upload back view</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Details & Additional Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#0f172a] border-b border-[#e2e8f0] pb-2">
                  Product Details
                </h3>

                <div>
                  <Label className="text-[#64748b] mb-2">Fabric</Label>
                  <Input
                    value={formData?.details?.fabric || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              details: {
                                ...prev.details,
                                fabric: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Type</Label>
                  <Input
                    value={formData?.details?.type || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              details: {
                                ...prev.details,
                                type: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">
                    Embellishment (comma separated)
                  </Label>
                  <Input
                    value={formData?.details?.embellishment?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              details: {
                                ...prev.details,
                                embellishment: e.target.value
                                  .split(",")
                                  .map((e) => e.trim())
                                  .filter((e) => e),
                              },
                            }
                          : null,
                      )
                    }
                    placeholder="Beads, Sequins, Embroidery"
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#64748b] mb-2">Neckline</Label>
                    <Input
                      value={formData?.details?.neckline || ""}
                      onChange={(e) =>
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                details: {
                                  ...prev.details,
                                  neckline: e.target.value,
                                },
                              }
                            : null,
                        )
                      }
                      className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                    />
                  </div>

                  <div>
                    <Label className="text-[#64748b] mb-2">Closure</Label>
                    <Input
                      value={formData?.details?.closure || ""}
                      onChange={(e) =>
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                details: {
                                  ...prev.details,
                                  closure: e.target.value,
                                },
                              }
                            : null,
                        )
                      }
                      className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#64748b] mb-2">Size</Label>
                    <Input
                      value={formData?.details?.size || ""}
                      onChange={(e) =>
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                details: {
                                  ...prev.details,
                                  size: e.target.value,
                                },
                              }
                            : null,
                        )
                      }
                      className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                    />
                  </div>

                  <div>
                    <Label className="text-[#64748b] mb-2">Color</Label>
                    <Input
                      value={formData?.details?.color || ""}
                      onChange={(e) =>
                        setFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                details: {
                                  ...prev.details,
                                  color: e.target.value,
                                },
                              }
                            : null,
                        )
                      }
                      className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Style</Label>
                  <Input
                    value={formData?.details?.style || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              details: {
                                ...prev.details,
                                style: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Wash Care</Label>
                  <Textarea
                    value={formData?.details?.washCare || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              details: {
                                ...prev.details,
                                washCare: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] min-h-[80px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#0f172a] border-b border-[#e2e8f0] pb-2">
                  Additional Information
                </h3>

                <div>
                  <Label className="text-[#64748b] mb-2">Includes</Label>
                  <Textarea
                    value={formData?.includes || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              includes: e.target.value,
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] min-h-[80px]"
                    placeholder="What's included with the product"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Disclaimer</Label>
                  <Textarea
                    value={formData?.disclaimer || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              disclaimer: e.target.value,
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Manufacturing & Contact */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#0f172a] border-b border-[#e2e8f0] pb-2">
                  Manufacturing Details
                </h3>

                <div>
                  <Label className="text-[#64748b] mb-2">Country</Label>
                  <Input
                    value={formData?.manufacturing?.country || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              manufacturing: {
                                ...prev.manufacturing,
                                country: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Manufacturer</Label>
                  <Input
                    value={formData?.manufacturing?.manufacturer || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              manufacturing: {
                                ...prev.manufacturing,
                                manufacturer: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Packed By</Label>
                  <Input
                    value={formData?.manufacturing?.packedBy || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              manufacturing: {
                                ...prev.manufacturing,
                                packedBy: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Address</Label>
                  <Textarea
                    value={formData?.manufacturing?.address || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              manufacturing: {
                                ...prev.manufacturing,
                                address: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] min-h-[80px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#0f172a] border-b border-[#e2e8f0] pb-2">
                  Contact Information
                </h3>

                <div>
                  <Label className="text-[#64748b] mb-2">Phone</Label>
                  <Input
                    value={formData?.contact?.phone || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              contact: {
                                ...prev.contact,
                                phone: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a]"
                  />
                </div>

                <div>
                  <Label className="text-[#64748b] mb-2">Note</Label>
                  <Textarea
                    value={formData?.contact?.note || ""}
                    onChange={(e) =>
                      setFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              contact: {
                                ...prev.contact,
                                note: e.target.value,
                              },
                            }
                          : null,
                      )
                    }
                    className="bg-[#f8fafc] border-[#e2e8f0] text-[#0f172a] min-h-[80px]"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-[#0f172a] border-b border-[#e2e8f0] pb-2">
                  Preview
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <Button
                    size="sm"
                    variant={previewMode === "before" ? "default" : "outline"}
                    onClick={() => setPreviewMode("before")}
                    className={
                      previewMode === "before"
                        ? "bg-[#7da8c7] hover:bg-[#7da8c7]/90"
                        : "border-[#e2e8f0] text-[#64748b]"
                    }
                  >
                    Before
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode === "after" ? "default" : "outline"}
                    onClick={() => setPreviewMode("after")}
                    className={
                      previewMode === "after"
                        ? "bg-[#7da8c7] hover:bg-[#7da8c7]/90"
                        : "border-[#e2e8f0] text-[#64748b]"
                    }
                  >
                    After
                  </Button>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#e2e8f0]">
                  <img
                    src={editingItem?.imageUrl}
                    alt="Preview"
                    className="w-full h-auto"
                  />
                </div>

                <GlassCard className="p-4">
                  <h4 className="text-[#0f172a] font-medium mb-2">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Title:</span>
                      <span className="text-[#0f172a] truncate ml-2">
                        {formData?.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Category:</span>
                      <span className="text-[#0f172a]">
                        {formData?.category || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Price:</span>
                      <span className="text-[#0f172a]">
                        ${formData?.price || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Featured:</span>
                      <span
                        className={
                          formData?.featured
                            ? "text-[#7da8c7]"
                            : "text-[#64748b]"
                        }
                      >
                        {formData?.featured ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Status:</span>
                      <span
                        className={
                          formData?.status ? "text-green-400" : "text-red-400"
                        }
                      >
                        {formData?.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-[#e2e8f0] mt-6">
            <Button
              onClick={handleSave}
              className="flex-1 bg-[#7da8c7] hover:bg-[#5a8faf] text-white"
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditingItem(null)}
              className="flex-1 border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9]"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create New Collection Modal */}
      {/* <CreateCollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateSave}
        availablePages={Object.keys(mockData)}
      /> */}
    </div>
  );
}
