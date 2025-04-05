
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/profile/ImageUpload";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

export function ClientProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    company: user?.company || "",
    avatar: user?.avatar || "",
    preferredPhotographer: "any",
    notificationEmail: true,
    notificationSMS: true,
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleAvatarChange = (url: string) => {
    setFormData(prev => ({ ...prev, avatar: url }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, save to database
    toast.success("Profile updated successfully");
  };

  const mockPhotographers = [
    { id: "any", name: "No Preference" },
    { id: "p1", name: "Alex Johnson" },
    { id: "p2", name: "Maria Garcia" },
    { id: "p3", name: "David Chen" },
    { id: "p4", name: "Sarah Thompson" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Client Profile</h2>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Verified Client</span>
          </div>
        </Badge>
      </div>

      <Separator />

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <ImageUpload 
                onChange={handleAvatarChange}
                initialImage={formData.avatar}
              />
              <div className="space-y-4 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      readOnly
                      disabled
                      className="opacity-70"
                    />
                    <p className="text-xs text-muted-foreground">Contact admin to change email</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience on our platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="preferredPhotographer">Preferred Photographer</Label>
              <Select 
                value={formData.preferredPhotographer} 
                onValueChange={(value) => handleSelectChange("preferredPhotographer", value)}
              >
                <SelectTrigger id="preferredPhotographer">
                  <SelectValue placeholder="Select preferred photographer" />
                </SelectTrigger>
                <SelectContent>
                  {mockPhotographers.map(photographer => (
                    <SelectItem key={photographer.id} value={photographer.id}>
                      {photographer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notification Preferences</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificationEmail">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive shoot updates via email</p>
                  </div>
                  <Switch
                    id="notificationEmail"
                    checked={formData.notificationEmail}
                    onCheckedChange={(checked) => handleSwitchChange("notificationEmail", checked)}
                  />
                </div>
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="notificationSMS">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get text alerts for important updates</p>
                  </div>
                  <Switch
                    id="notificationSMS"
                    checked={formData.notificationSMS}
                    onCheckedChange={(checked) => handleSwitchChange("notificationSMS", checked)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
            <CardDescription>Your billing information for invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingAddress">Street Address</Label>
                <Input
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  placeholder="123 Main St"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCity">City</Label>
                  <Input
                    id="billingCity"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingState">State</Label>
                  <Input
                    id="billingState"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleChange}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingZip">ZIP Code</Label>
                  <Input
                    id="billingZip"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleChange}
                    placeholder="ZIP"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>Assigned Rep: John Smith</span>
                </div>
              </Badge>
            </div>
            <Button type="submit">Update My Info</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
