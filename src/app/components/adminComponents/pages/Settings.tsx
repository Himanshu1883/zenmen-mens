import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Bell, Globe, Palette, Shield, User } from "lucide-react";
import { GlassCard } from "../dashboard/GlassCard";

export default function Settings() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage your admin preferences and configurations
        </p>
      </div>

      {/* Profile Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-[#C8A96E]" />
          <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-gray-300 mb-2">Full Name</Label>
            <Input
              defaultValue="Sarah Anderson"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300 mb-2">Email Address</Label>
            <Input
              defaultValue="sarah.anderson@zenmen.com"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300 mb-2">Phone Number</Label>
            <Input
              defaultValue="+1 (555) 123-4567"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300 mb-2">Role</Label>
            <Input
              defaultValue="Administrator"
              disabled
              className="bg-white/5 border-white/10 text-gray-400"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button className="bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white">
            Save Changes
          </Button>
        </div>
      </GlassCard>

      {/* Notification Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-5 h-5 text-[#C8A96E]" />
          <h2 className="text-xl font-semibold text-white">
            Notification Preferences
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">
                Email Notifications
              </p>
              <p className="text-gray-400 text-xs">
                Receive email updates for new orders
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">Order Updates</p>
              <p className="text-gray-400 text-xs">
                Get notified when order status changes
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">
                User Registration
              </p>
              <p className="text-gray-400 text-xs">
                Alert when new users sign up
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">Low Stock Alerts</p>
              <p className="text-gray-400 text-xs">
                Notify when product stock is running low
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </GlassCard>

      {/* Security Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-[#C8A96E]" />
          <h2 className="text-xl font-semibold text-white">Security</h2>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-gray-300 mb-2">Current Password</Label>
            <Input
              type="password"
              placeholder="Enter current password"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-gray-300 mb-2">New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300 mb-2">Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <Separator className="bg-white/10" />

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">
                Two-Factor Authentication
              </p>
              <p className="text-gray-400 text-xs">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch />
          </div>

          <Button className="bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white">
            Update Password
          </Button>
        </div>
      </GlassCard>

      {/* Appearance Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-[#C8A96E]" />
          <h2 className="text-xl font-semibold text-white">Appearance</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">Dark Mode</p>
              <p className="text-gray-400 text-xs">
                Use dark theme (currently active)
              </p>
            </div>
            <Switch defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
            <div>
              <p className="text-white text-sm font-medium">Compact View</p>
              <p className="text-gray-400 text-xs">
                Use condensed layout for tables
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </GlassCard>

      {/* Website Settings */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-5 h-5 text-[#C8A96E]" />
          <h2 className="text-xl font-semibold text-white">
            Website Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="text-gray-300 mb-2">Site Title</Label>
            <Input
              defaultValue="ZENmen Bespoke Tailoring"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300 mb-2">Site Tagline</Label>
            <Input
              defaultValue="Refined Elegance for the Modern Gentleman"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300 mb-2">Contact Email</Label>
            <Input
              defaultValue="contact@silverstitch.com"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <div>
            <Label className="text-gray-300 mb-2">Support Phone</Label>
            <Input
              defaultValue="+1 (555) 987-6543"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        <div className="mt-6">
          <Button className="bg-[#C8A96E] hover:bg-[#C8A96E]/90 text-white">
            Save Website Settings
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
