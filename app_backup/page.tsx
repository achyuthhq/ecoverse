import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

import { Button } from '@/components/ui/button2';
import { motion } from 'framer-motion';

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-slate-900">
      {/* Decorative Circles */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-500 opacity-10 blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>
      
      <div className="container px-4 py-16 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <motion.div 
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-teal-400 to-blue-500 leading-tight mb-6">
              AI-Powered Waste Management
            </h1>
            <p className="text-xl text-gray-300 max-w-xl mx-auto lg:mx-0 mb-8">
              Upload an image of any waste item and get instant AI analysis on proper disposal, 
              environmental impact, and sustainable alternatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth/login">
                <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 rounded-full glass-card shadow-lg shadow-teal-500/20">
                  Get Started
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full glass-card bg-opacity-10">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
          
          {/* Right Content - Image */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-500/20 to-blue-500/20 blur-xl"></div>
              <div className="relative h-full w-full rounded-3xl overflow-hidden glass-dark">
                <Image
                  src="/images/ecoverse-preview.png"
                  alt="Ecoverse App Preview"
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Features Section */}
        <motion.div 
          className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {[
            {
              title: "Smart Analysis",
              description: "AI-powered recognition of waste items with detailed classification.",
              icon: "🧠"
            },
            {
              title: "Environmental Impact",
              description: "Learn about the environmental harm caused by improper disposal.",
              icon: "🌎"
            },
            {
              title: "Sustainable Alternatives",
              description: "Discover eco-friendly alternatives to common waste products.",
              icon: "♻️"
            }
          ].map((feature, index) => (
            <div key={index} className="p-8 rounded-2xl glass-card hover:shadow-xl transition-all duration-300 ease-in-out">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
      
      {/* Footer */}
      <footer className="w-full py-6 mt-auto text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} Ecoverse. All rights reserved.</p>
      </footer>
    </main>
  );
} 