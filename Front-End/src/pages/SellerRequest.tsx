
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/api";

const SellerRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    emailAddress: "",
    businessName: "",
    gender: "",
    password: ""
  });
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      toast({
        title: "Error",
        description: "Please accept the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Submit seller request to backend
      const sellerRequestData = {
        name: formData.name,
        email: formData.emailAddress,
        password: formData.password,
        phone: formData.phoneNumber,
        businessName: formData.businessName,
        gender: formData.gender,
        role: "seller"
      };

      await api.post('/auth/seller-request', sellerRequestData);
      
      toast({
        title: "Success",
        description: "Your seller request has been submitted. You will be notified once approved by an admin.",
      });
      
      // Redirect to login page
      navigate('/login');
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit seller request';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8 shadow-2xl">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Link>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Seller Account Request</h2>
            
            <div className="text-sm text-gray-600">
              <span>Already have an account? </span>
              <Link to="/login" className="text-purple-600 hover:underline">
                Log In
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2 relative">
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.emailAddress}
                onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                className="w-full p-3 pr-14 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <Mail className="absolute right-4 top-[30%] translate-y-[-50%] w-5 h-5 text-cyan-500 pointer-events-none" />
            </div>

            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Business Name"
                value={formData.businessName}
                onChange={(e) => handleInputChange("businessName", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="space-y-2">
              <Select onValueChange={(value) => handleInputChange("gender", value)} required>
                <SelectTrigger className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                minLength={6}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="seller-terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <label htmlFor="seller-terms" className="text-sm text-gray-600">
                I have read the{" "}
                <Link to="/terms" className="text-purple-600 hover:underline">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md transition-colors"
              disabled={!agreeTerms || isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerRequest;
