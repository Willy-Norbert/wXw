
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Link } from 'react-router-dom';

export const SellerBlocked = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center shadow-xl border-purple-200">
        <CardHeader className="pb-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-purple-300" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-gray-600">
            <p className="text-lg font-medium mb-2">No permission, your request is still in progress.</p>
          </div>
          
          {/* Lottie Animation */}
          <div className="flex justify-center">
            <img 
              src="/favicon.ico" // Replace with your Lottie animation URL
              alt="Waiting for approval"
              className="w-64 h-64 object-contain"
            />
          </div>
          <Link to="/">
          <Button className='mb-2'>
            Back Home
          </Button>
          </Link>
          <div className="bg-purple-200 border border-purple-400 rounded-lg p-4">
            <p className="text-sm text-white-800">
              <strong>What's next?</strong><br />
              Our admin team will review your seller application and notify you via email once approved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
