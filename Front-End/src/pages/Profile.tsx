
import React, { useContext, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MapPin, Building, FileText } from 'lucide-react';
import { getUserProfile, updateProfile } from '@/api/profile';
import { toast } from 'sonner';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    company: '',
  });

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      console.log('Profile update successful:', data);
      
      // Update the query cache immediately
      queryClient.setQueryData(['user-profile'], data);
      
      // Update the auth context with new user data
      updateUser({ ...user, ...data });
      
      // Set editing to false immediately
      setIsEditing(false);
      
      // Show success toast
      toast.success('Profile updated successfully!');
      
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  });

  useEffect(() => {
    if (profileData) {
      console.log('Setting form data from profile:', profileData);
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        company: profileData.company || '',
      });
    }
  }, [profileData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting profile update:', formData);
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        company: profileData.company || '',
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout currentPage="profile">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    console.error('Profile loading error:', error);
    return (
      <DashboardLayout currentPage="profile">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load profile</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['user-profile'] })}>
              Retry
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-3">
          <User className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Profile Settings
          </h1>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            ) : (
              <div className="space-x-2">
                <Button onClick={handleCancel} variant="outline" disabled={updateProfileMutation.isPending}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium">
                    <User className="w-4 h-4" />
                    <span>Full Name</span>
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  ) : (
                    <p className="text-gray-700 p-2 bg-gray-50 rounded">{profileData?.name || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium">
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  ) : (
                    <p className="text-gray-700 p-2 bg-gray-50 rounded">{profileData?.email || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium">
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-700 p-2 bg-gray-50 rounded">{profileData?.phone || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium">
                    <Building className="w-4 h-4" />
                    <span>Company</span>
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                    />
                  ) : (
                    <p className="text-gray-700 p-2 bg-gray-50 rounded">{profileData?.company || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium">
                  <MapPin className="w-4 h-4" />
                  <span>Address</span>
                </label>
                {isEditing ? (
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                ) : (
                  <p className="text-gray-700 p-2 bg-gray-50 rounded">{profileData?.address || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium">
                  <FileText className="w-4 h-4" />
                  <span>Bio</span>
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 p-2 bg-gray-50 rounded min-h-[100px]">{profileData?.bio || 'Not provided'}</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Account Role</label>
                <p className="text-lg font-semibold capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Member Since</label>
                <p className="text-lg font-semibold">
                  {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
