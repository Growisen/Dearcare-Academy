"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkAuthStatus, AuthUser } from "../lib/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'student' | 'supervisor')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await checkAuthStatus();
        
        if (!currentUser) {
          router.push('/signin');
          return;
        }

        if (!allowedRoles.includes(currentUser.role)) {
          // Redirect to appropriate dashboard based on role
          switch (currentUser.role) {
            case 'admin':
              router.push('/dashboard');
              break;
            case 'student':
              router.push('/student-dashboard');
              break;
            case 'supervisor':
              router.push('/supervisor-dashboard');
              break;
            default:
              router.push('/signin');
          }
          return;
        }

        setUser(currentUser);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}