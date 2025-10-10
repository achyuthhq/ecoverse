"use client";

import PageTemplate from "@/components/page-template";
import { Users, MessageCircle, Heart } from "lucide-react";

export default function CommunityPage() {
  return (
    <PageTemplate 
      title="Community" 
      description="Connect with like-minded environmental enthusiasts"
    >
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="text-center py-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Community Hub</h2>
            </div>
            <p className="text-gray-600 mb-8">
              Connect with fellow eco-warriors and share your environmental journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg w-fit mx-auto mb-4">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Discussions</h3>
                <p className="text-gray-600 text-sm">
                  Share tips and discuss environmental topics
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg w-fit mx-auto mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Challenges</h3>
                <p className="text-gray-600 text-sm">
                  Join community challenges and earn rewards
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg w-fit mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Groups</h3>
                <p className="text-gray-600 text-sm">
                  Join local environmental groups
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}