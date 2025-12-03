"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button2";
import { Input } from "@/components/ui/input2";
import { Label } from "@/components/ui/label2";
import { Typewriter } from "@/components/ui/typewriter";
import { useToast } from "@/components/ui/use-toast";

function PasswordInput({
  className,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const id = React.useId();
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  
  return (
    <div className="grid w-full items-center gap-2">
      {label && <Label htmlFor={id} className="text-white/90 text-sm font-montserrat font-medium">{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          className={`pe-10 ${className || ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-white/70 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

function SignInForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign in failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-white font-montserrat">Sign in to your account</h1>
        <p className="text-balance text-sm text-white/70 font-montserrat">Enter your email below to sign in</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white/90 text-sm font-montserrat font-medium">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-card border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 h-11 rounded-xl font-montserrat"
          />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="glass-card border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 h-11 rounded-xl font-montserrat"
        />
        <Button
          type="submit"
          className="mt-2 bg-white text-gray-900 hover:bg-gray-100 border-0 h-11 rounded-xl font-montserrat font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </form>
  );
}

function SignUpForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Sign up failed");
      }

      // Auto sign in after signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Sign up successful",
          description: "Please sign in with your new account.",
        });
        router.push("/auth/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-white font-montserrat">Create an account</h1>
        <p className="text-balance text-sm text-white/70 font-montserrat">Enter your details below to sign up</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="name" className="text-white/90 text-sm font-montserrat font-medium">Full Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="glass-card border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 h-11 rounded-xl font-montserrat"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white/90 text-sm font-montserrat font-medium">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-card border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 h-11 rounded-xl font-montserrat"
          />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          required
          autoComplete="new-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="glass-card border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder:text-white/50 focus:border-white/40 focus:ring-2 focus:ring-white/20 h-11 rounded-xl font-montserrat"
        />
        <Button
          type="submit"
          className="mt-2 bg-white text-gray-900 hover:bg-gray-100 border-0 h-11 rounded-xl font-montserrat font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
      </div>
    </form>
  );
}

function AuthFormContainer({
  isSignIn,
  onToggle,
}: {
  isSignIn: boolean;
  onToggle: () => void;
}) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign in error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-[350px] gap-2">
      <div className="glass-card rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl p-8 relative overflow-hidden">
        {isSignIn ? <SignInForm /> : <SignUpForm />}
      </div>
      <div className="text-center text-sm text-white/80 font-montserrat">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
        <Button
          variant="link"
          className="pl-1 text-white hover:text-white/80 font-montserrat"
          onClick={onToggle}
          type="button"
        >
          {isSignIn ? "Sign up" : "Sign in"}
        </Button>
      </div>
      <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/20">
        <span className="relative z-10 glass-card px-2 text-white/70 font-montserrat">Or continue with</span>
      </div>
      <Button
        variant="outline"
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:text-white glass-card font-montserrat"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google icon"
          className="mr-2 h-4 w-4"
        />
        {isGoogleLoading ? "Connecting..." : "Continue with Google"}
      </Button>
    </div>
  );
}

const defaultSignInContent = {
  image: {
    src: "https://i.ibb.co/CKc63fx6/image.png",  
    alt: "A beautiful interior design for sign-in",
  },
  quote: {
    text: "Welcome Back! The journey continues.",
    author: "Ecoverse",
  },
};

const defaultSignUpContent = {
  image: {
    src: "https://i.ibb.co/CKc63fx6/image.png",
    alt: "A vibrant, modern space for new beginnings",
  },
  quote: {
    text: "Create an account. A new chapter awaits.",
    author: "Ecoverse",
  },
};

export default function LoginPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const finalSignInContent = {
    image: { ...defaultSignInContent.image },
    quote: { ...defaultSignInContent.quote },
  };
  const finalSignUpContent = {
    image: { ...defaultSignUpContent.image },
    quote: { ...defaultSignUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen md:grid md:grid-cols-2" style={{ backgroundColor: '#0c0c0c' }}>
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12">
        <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} />
      </div>

      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-x-0 bottom-0 h-[100px] bg-gradient-to-t from-[#0c0c0c] to-transparent" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end p-2 pb-6">
          <blockquote className="space-y-2 text-center glass-card rounded-2xl px-8 py-6 shadow-xl">
            <p className="text-lg font-medium text-white">
              "<Typewriter
                key={currentContent.quote.text}
                text={currentContent.quote.text}
                speed={60}
              />"
            </p>
            <cite className="block text-sm font-light text-gray-400 not-italic">
              — {currentContent.quote.author}
            </cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
