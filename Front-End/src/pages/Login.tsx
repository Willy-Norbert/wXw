
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { loginUser } from '@/api/auth';
import { AuthContext } from '@/contexts/AuthContext';
import { AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log('✅ LOGIN SUCCESS - Full API Response:', data);
      console.log('✅ LOGIN SUCCESS - User data:', data.data);
      console.log('✅ LOGIN SUCCESS - User details:', {
        id: data.data.id,
        email: data.data.email,
        role: data.data.role,
        isActive: data.data.isActive,
        sellerStatus: data.data.sellerStatus,
        tokenLength: data.data.token?.length
      });
      
      try {
        login(data.data);
        console.log('✅ AuthContext login called successfully');
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        // Route users based on their role
        const userRole = data.data.role?.toLowerCase();
        console.log('✅ Routing user based on role:', userRole);
        
        if (userRole === 'seller') {
          console.log('✅ Redirecting seller to vendor dashboard');
          navigate('/vendor-dashboard');
        } else if (userRole === 'admin') {
          console.log('✅ Redirecting admin to admin dashboard');
          navigate('/dashboard');
        } else {
          console.log('✅ Redirecting buyer to home page');
          navigate('/');
        }
      } catch (error) {
        console.error('❌ Error in login success handler:', error);
      }
    },
    onError: (error: any) => {
      console.error('❌ Login mutation error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      toast({
        title: "Login failed",
        description: error.response?.data?.message || error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔑 Login attempt for email:', email);
    console.log('🔑 Login mutation state:', {
      isPending: loginMutation.isPending,
      isError: loginMutation.isError,
      error: loginMutation.error
    });
    
    try {
      loginMutation.mutate({ email, password });
      console.log('🔑 Login mutation called successfully');
    } catch (error) {
      console.error('❌ Error calling login mutation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
          <Link to="/">
         <img src="/wxc.png" alt="Logo" className="w-16 h-16 mx-auto mb-4" />
         </Link>
        <div className="bg-white rounded-lg p-8 shadow-2xl">
          <div className="mb-6 text-center">
           
            
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            
            {onmessage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <p className="text-sm text-blue-700">{onmessage}</p>
                </div>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <span>Don't have an account? </span>
              <Link to="/register" className="text-purple-600 hover:underline">
                Sign Up
              </Link>
            </div>
          </div>

      <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-black "
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">Want to start selling?</p>
            <Link
              to="/seller-request"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors"
            >
              Start Selling Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
