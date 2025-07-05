
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Link } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers } from '@/api/users';

interface ProductFormProps {
  editingProduct?: any;
  categories: any[];
  onUrlChange: (url: string) => void;
  previewImage: string;
  isLoading: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  editingProduct,
  categories,
  onUrlChange,
  previewImage,
  isLoading,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    coverImage: '',
    colors: [] as string[],
    sizes: [] as string[],
    assignedSellerId: '' // New field for seller assignment
  });

  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Fetch sellers for assignment dropdown
  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    select: (response) => {
      const users = response.data || [];
      return users.filter(user => user.role.toLowerCase() === 'seller');
    }
  });

  const sellers = usersData || [];

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        price: editingProduct.price?.toString() || '',
        stock: editingProduct.stock?.toString() || '',
        categoryId: editingProduct.categoryId?.toString() || '',
        coverImage: editingProduct.coverImage || '',
        colors: editingProduct.colors || [],
        sizes: editingProduct.sizes || [],
        assignedSellerId: editingProduct.createdById?.toString() || ''
      });
      setImageUrl(editingProduct.coverImage || '');
    }
  }, [editingProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      coverImage: previewImage || imageUrl || formData.coverImage,
      assignedSellerId: formData.assignedSellerId ? parseInt(formData.assignedSellerId) : undefined
    };

    console.log('🚀 Submitting product form with data:', submitData);
    onSubmit(submitData);
  };

  const addColor = () => {
    if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor.trim()]
      }));
      setNewColor('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  const addSize = () => {
    if (newSize.trim() && !formData.sizes.includes(newSize.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize.trim()]
      }));
      setNewSize('');
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    onUrlChange(url);
    setFormData(prev => ({ ...prev, coverImage: url }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price">Price (Rwf) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
            required
          />
        </div>

        {/* Seller Assignment - Only show for admins */}
        <div className="md:col-span-2">
          <Label htmlFor="assignedSeller">Assign to Seller (Optional)</Label>
          <Select value={formData.assignedSellerId} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedSellerId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select seller (leave empty to assign to yourself)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="self">Assign to myself</SelectItem>
              {sellers.map((seller) => (
                <SelectItem key={seller.id} value={seller.id.toString()}>
                  {seller.businessName || seller.name} ({seller.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      {/* Image URL Section - Simple URL input only */}
      <div>
        <Label htmlFor="imageUrl">Product Image URL</Label>
        <Input
          id="imageUrl"
          placeholder="Enter image URL or use FileUpload below"
          value={imageUrl}
          onChange={(e) => handleImageUrlChange(e.target.value)}
        />
        {previewImage && (
          <div className="mt-2">
            <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover rounded border" />
          </div>
        )}
      </div>

      {/* Colors Section */}
      <div>
        <Label>Available Colors</Label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Add color"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
          />
          <Button type="button" onClick={addColor} size="sm">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.colors.map((color) => (
            <Badge key={color} variant="secondary" className="flex items-center gap-1">
              {color}
              <X className="w-3 h-3 cursor-pointer" onClick={() => removeColor(color)} />
            </Badge>
          ))}
        </div>
      </div>

      {/* Sizes Section */}
      <div>
        <Label>Available Sizes</Label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Add size"
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
          />
          <Button type="button" onClick={addSize} size="sm">Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.sizes.map((size) => (
            <Badge key={size} variant="secondary" className="flex items-center gap-1">
              {size}
              <X className="w-3 h-3 cursor-pointer" onClick={() => removeSize(size)} />
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : (editingProduct ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
};
