import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Upload, Info, Camera } from "lucide-react";

import DashboardShell from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/image-upload";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AnalyzePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-500 to-green-400 bg-clip-text text-transparent">
            Analyze Waste
          </h1>
          </div>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base px-4">
            Upload an image of your waste item for analysis and recycling recommendations
          </p>
        </div>

        {/* Upload Options */}
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Upload Image</span>
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              <span>Take Photo</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30 p-6">
              <div className="max-w-2xl mx-auto">
                <ImageUpload />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="camera" className="mt-0">
            <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30 p-6">
              <div className="max-w-2xl mx-auto text-center">
                <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 flex flex-col items-center justify-center">
                  <div className="p-4 rounded-full bg-blue-50 mb-4">
                    <Camera className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Use your camera</h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    Take a clear photo of the item you want to analyze. Make sure it's well-lit and centered.
                  </p>
                  <Button className="bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500">
                    Open Camera
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 border border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Clear Image</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Take a clear, well-lit photo of the item. Avoid shadows and make sure the item is in focus.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 border border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Single Item</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                For best results, analyze one item at a time. Multiple items may affect accuracy.
              </CardDescription>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 border border-gray-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium">Clean Item</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                If possible, clean the item before analysis to help our system identify materials correctly.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="glass-card-light rounded-xl shadow-lg overflow-hidden border border-white/30">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-purple-100">
                <Info className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/60 p-4 rounded-lg border border-gray-100">
                <h3 className="font-medium text-gray-900 mb-2">How accurate is the analysis?</h3>
                <p className="text-sm text-gray-600">
                  Our AI model is trained on thousands of waste items and can identify common materials with high accuracy. 
                  However, some complex or unusual items may require manual verification.
                </p>
              </div>
              
              <div className="bg-white/60 p-4 rounded-lg border border-gray-100">
                <h3 className="font-medium text-gray-900 mb-2">What information will I receive?</h3>
                <p className="text-sm text-gray-600">
                  You'll get details about the material composition, recycling recommendations, environmental impact, 
                  and proper disposal methods for your item.
                </p>
              </div>
              
              <div className="bg-white/60 p-4 rounded-lg border border-gray-100">
                <h3 className="font-medium text-gray-900 mb-2">Is my data private?</h3>
                <p className="text-sm text-gray-600">
                  Yes, all uploaded images and analysis results are kept private to your account. We use anonymized data 
                  to improve our AI models, but never share your personal information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 