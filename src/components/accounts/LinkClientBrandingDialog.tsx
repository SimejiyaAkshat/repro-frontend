
import { useState } from "react";
import { User } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandingImageUpload } from "@/components/profile/BrandingImageUpload";

// Mock data for clients and branding
const mockClients = [
  { id: "1", name: "Acme Real Estate" },
  { id: "2", name: "Pacific Properties" },
  { id: "3", name: "Sunset Realty" },
  { id: "4", name: "Metropolitan Homes" },
];

interface LinkClientBrandingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (
    userId: string, 
    data: { 
      linkedClients: string[],
      brandingSettings: {
        logo?: string;
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
        customDomain?: string;
      }
    }
  ) => void;
}

export function LinkClientBrandingDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
}: LinkClientBrandingDialogProps) {
  const [linkedClients, setLinkedClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [brandingSettings, setBrandingSettings] = useState({
    logo: "",
    primaryColor: "#1a56db",
    secondaryColor: "#7e3af2",
    fontFamily: "Inter",
    customDomain: "",
  });
  
  const handleAddClient = () => {
    if (selectedClient && !linkedClients.includes(selectedClient)) {
      setLinkedClients([...linkedClients, selectedClient]);
      setSelectedClient("");
    }
  };

  const handleRemoveClient = (clientId: string) => {
    setLinkedClients(linkedClients.filter(id => id !== clientId));
  };

  const handleBrandingChange = (key: string, value: string) => {
    setBrandingSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    if (user) {
      onSubmit(user.id, {
        linkedClients,
        brandingSettings
      });
    }
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Link Client & Branding</DialogTitle>
          <DialogDescription>
            Associate {user.name} with clients and customize branding settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="clients">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="clients">Linked Clients</TabsTrigger>
            <TabsTrigger value="branding">Tour Branding</TabsTrigger>
          </TabsList>
          
          <TabsContent value="clients" className="space-y-4 pt-4">
            <div className="flex space-x-2">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddClient} disabled={!selectedClient}>Add</Button>
            </div>

            <div className="border rounded-lg p-4 min-h-[200px]">
              <h3 className="font-medium mb-2">Linked Clients</h3>
              {linkedClients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients linked yet</p>
              ) : (
                <ul className="space-y-2">
                  {linkedClients.map(clientId => {
                    const client = mockClients.find(c => c.id === clientId);
                    return (
                      <li key={clientId} className="flex justify-between items-center border-b pb-2">
                        <span>{client?.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveClient(clientId)}
                        >
                          Remove
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="branding" className="space-y-4 pt-4">
            <div className="flex flex-col space-y-4">
              <div>
                <Label>Logo</Label>
                <BrandingImageUpload
                  value={brandingSettings.logo}
                  onChange={(url) => handleBrandingChange("logo", url)}
                  className="h-24 w-full"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={brandingSettings.primaryColor}
                      onChange={(e) => handleBrandingChange("primaryColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={brandingSettings.primaryColor}
                      onChange={(e) => handleBrandingChange("primaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      id="secondaryColor"
                      value={brandingSettings.secondaryColor}
                      onChange={(e) => handleBrandingChange("secondaryColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={brandingSettings.secondaryColor}
                      onChange={(e) => handleBrandingChange("secondaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select 
                  value={brandingSettings.fontFamily}
                  onValueChange={(value) => handleBrandingChange("fontFamily", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  placeholder="tours.yourdomain.com"
                  value={brandingSettings.customDomain}
                  onChange={(e) => handleBrandingChange("customDomain", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Configure a custom domain for this client's property tours
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
