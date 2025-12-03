"use client";

import { Button } from "@/components/ui/button2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Twitter, Github, Linkedin } from "lucide-react";

interface ContactSectionProps {
  email: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export default function ContactSection({ email, socialLinks }: ContactSectionProps) {
  return (
    <Card className="bg-white border border-gray-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">Contact Me</CardTitle>
        <CardDescription>
          Have questions or feedback? We'd love to hear from you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-gray-500" />
          <span className="text-gray-700">
            <a href={`mailto:${email}`}>{email}</a>
          </span>
        </div>
      </CardContent>
    </Card>
  );
} 