import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Eye, Globe, Plus } from "lucide-react";
import { GlassCard } from "../dashboard/GlassCard";

interface Section {
  id: string;
  name: string;
  slug: string;
  status: "Active" | "Inactive";
  images: number;
  lastUpdated: string;
}

const mockSections: Section[] = [
  {
    id: "1",
    name: "Home Page",
    slug: "/",
    status: "Active",
    images: 12,
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    name: "About Page",
    slug: "/about",
    status: "Active",
    images: 6,
    lastUpdated: "1 day ago",
  },
  {
    id: "3",
    name: "Collections Page",
    slug: "/collections",
    status: "Active",
    images: 24,
    lastUpdated: "3 hours ago",
  },
  {
    id: "4",
    name: "Custom Design Page",
    slug: "/custom-design",
    status: "Active",
    images: 8,
    lastUpdated: "5 hours ago",
  },
  {
    id: "5",
    name: "Measurement Page",
    slug: "/measurements",
    status: "Active",
    images: 5,
    lastUpdated: "1 day ago",
  },
  {
    id: "6",
    name: "Embroidery Page",
    slug: "/embroidery",
    status: "Active",
    images: 10,
    lastUpdated: "6 hours ago",
  },
  {
    id: "7",
    name: "Contact Page",
    slug: "/contact",
    status: "Active",
    images: 3,
    lastUpdated: "2 days ago",
  },
];

export default function WebsiteSections() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            Website Sections
          </h1>
          <p className="text-gray-400">
            Manage your website pages and sections
          </p>
        </div>
        <Button className="bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Total Sections</p>
          <p className="text-2xl font-semibold text-white">7</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Active</p>
          <p className="text-2xl font-semibold text-green-400">7</p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-gray-400 text-sm mb-1">Total Images</p>
          <p className="text-2xl font-semibold text-[#C8A96E]">68</p>
        </GlassCard>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockSections.map((section) => (
          <GlassCard key={section.id} hover className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(244, 167, 157, 0.2) 0%, rgba(244, 167, 157, 0.05) 100%)",
                }}
              >
                <Globe className="w-6 h-6 text-[#C8A96E]" />
              </div>
              <Badge
                variant="outline"
                className="border-green-500/50 text-green-400 bg-green-500/20"
              >
                {section.status}
              </Badge>
            </div>

            <h3 className="text-white font-semibold text-lg mb-2">
              {section.name}
            </h3>
            <p className="text-gray-400 text-sm mb-4">{section.slug}</p>

            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
              <div className="text-sm">
                <span className="text-gray-400">Images: </span>
                <span className="text-[#C8A96E] font-medium">
                  {section.images}
                </span>
              </div>
              <div className="text-xs text-gray-500">{section.lastUpdated}</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-white/10 text-gray-300 hover:text-[#C8A96E] hover:border-[#C8A96E]/50"
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
