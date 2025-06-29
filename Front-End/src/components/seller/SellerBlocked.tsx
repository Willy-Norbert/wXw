
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export const SellerBlocked = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto text-center shadow-xl border-orange-200">
        <CardHeader className="pb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
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
              src="https://assets-v2.lottiefiles.com/a/400d8e32-117d-11ee-b1e8-a7eaa98acd93/3542112CSR.gif" 
              alt="Waiting for approval"
              className="w-64 h-64 object-contain"
            />
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>What's next?</strong><br />
              Our admin team will review your seller application and notify you via email once approved.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
