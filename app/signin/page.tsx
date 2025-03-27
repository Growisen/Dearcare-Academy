"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Lock, Mail, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const LoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px)] before:bg-[length:40px_40px] before:opacity-70">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 70, damping: 15 }}
        className="relative z-10 w-full max-w-sm bg-white shadow-xl rounded-2xl overflow-hidden border border-dCblue/10"
      >
        <div className="p-6 space-y-6">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex flex-col items-center space-y-3"
          >
            <Image src="/logo2.png" alt="Logo" width={150} height={50} className="mb-2 object-contain" />
            <h1 className="text-2xl font-bold text-dCblue">Admin Portal</h1>
            <p className="text-dCblack/70 text-center text-sm">Secure Access to Your Dashboard</p>
          </motion.div>

          <form onSubmit={handleSignIn} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 text-sm text-red-500 bg-red-50 rounded-lg"
              >
                {error}
              </motion.div>
            )}
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3, type: "spring" }}>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dCblue/70 group-focus-within:text-dCorange transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full pl-12 pr-3 py-2 rounded-lg border border-dCblue/30 focus:border-dCorange focus:ring-2 focus:ring-dCorange/30 transition duration-300 text-dCblack text-sm"
                />
              </div>
            </motion.div>
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4, type: "spring" }}>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dCblue/70 group-focus-within:text-dCorange transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-3 py-2 rounded-lg border border-dCblue/30 focus:border-dCorange focus:ring-2 focus:ring-dCorange/30 transition duration-300 text-dCblack text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dCblue/70 hover:text-dCorange transition-colors text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-dCblue text-white rounded-lg hover:bg-dCorange group transition duration-300 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </form>

          <div className="text-center">
            <a href="#" className="text-xs text-dCblue hover:text-dCorange transition">Forgot Password?</a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;