"use client";

import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Mail, ExternalLink } from "lucide-react";
import { ReactNode } from "react";

interface TeamMemberProps {
  name: string;
  title: ReactNode;
  description: string;
  imageUrl: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
}

export default function TeamMember({
  name,
  title,
  description,
  imageUrl,
  socialLinks,
}: TeamMemberProps) {
  return (
    <div className="group relative w-full max-w-4xl mx-auto bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full -translate-y-16 translate-x-16 blur-2xl group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-400/10 to-green-400/10 rounded-full translate-y-12 -translate-x-12 blur-xl group-hover:scale-110 transition-transform duration-500" />
      
      <div className="relative flex flex-col lg:flex-row lg:items-stretch overflow-hidden">
        {/* Image Section - Separated with 3D effect */}
        <div className="relative lg:w-72 lg:flex-shrink-0 lg:mr-8 mb-6 lg:mb-0">
          <div className="relative w-full h-64 lg:h-96 transform transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1 group-hover:translate-x-2 group-hover:translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-3xl blur-sm group-hover:blur-md transition-all duration-500"></div>
        <img 
          src={imageUrl} 
          alt={`${name}'s profile picture`}
              className="relative w-full h-full object-contain lg:object-cover object-center rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500"
        />
            {/* Gradient overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:hidden rounded-3xl" />
          </div>
          
          {/* Floating badge for mobile */}
          <div className="absolute top-4 left-4 lg:hidden">
            <div className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
              <span className="text-sm font-semibold text-gray-800">Student Innovator</span>
            </div>
      </div>
        </div>
        
        {/* Content Section - Reduced height */}
        <div className="flex-1 flex flex-col justify-center p-6 lg:p-8 gap-3 lg:gap-4">
          {/* Name and Title */}
          <div className="space-y-2">
            <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-teal-600 bg-clip-text text-transparent">
              {name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-base font-medium text-gray-700/90">
              <span className="text-lg font-semibold">Student Innovator</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-xs text-gray-400">(The Hyderabad Public School, Kadapa)</span>
            </div>
          </div>
          
          {/* Description - Shorter */}
          <div className="space-y-3">
            <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
          {description}
        </p>
          </div>
          
          {/* Social Links */}
          <div className="flex gap-3 pt-2">
          {socialLinks.twitter && (
            <Button 
              variant="ghost" 
              size="icon" 
                className="rounded-full h-10 w-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                onClick={() => window.open(socialLinks.twitter, '_blank')}
            >
                <Twitter className="h-4 w-4" />
            </Button>
          )}
          {socialLinks.linkedin && (
            <Button 
              variant="ghost" 
              size="icon" 
                className="rounded-full h-10 w-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                onClick={() => window.open(socialLinks.linkedin, '_blank')}
            >
                <Linkedin className="h-4 w-4" />
            </Button>
          )}
          {socialLinks.email && (
            <Button 
              variant="ghost" 
              size="icon" 
                className="rounded-full h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                onClick={() => window.open(`mailto:${socialLinks.email}`, '_blank')}
            >
                <Mail className="h-4 w-4" />
            </Button>
          )}
          </div>
        </div>
      </div>
    </div>
  );
} 