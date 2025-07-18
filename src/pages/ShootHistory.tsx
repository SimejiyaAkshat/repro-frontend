
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useShoots } from '@/context/ShootsContext';
import { useNavigate } from 'react-router-dom';
import { Eye, Calendar, Clock, MapPin, ChevronRight, ArrowRight, Building, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShootData } from '@/types/shoots';
import { useAuth } from '@/components/auth/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const statusColors = {
  'scheduled': 'bg-blue-500',
  'completed': 'bg-green-500',
  'pending': 'bg-yellow-500',
  'hold': 'bg-purple-500',
  'booked': 'bg-orange-500',
};

const ShootHistory = () => {
  const [activeTab, setActiveTab] = useState('scheduled');
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterAddress, setFilterAddress] = useState('');
  const [filterPhotographer, setFilterPhotographer] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getClientShootsByStatus, getUniquePhotographers, fetchShoots } = useShoots();
  const { user } = useAuth();

  // Get all photographers for filter dropdown
  const photographers = getUniquePhotographers();

  useEffect(() => {
    // Simulate loading for smoother UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Get client shoots by status
  const scheduledShoots = getClientShootsByStatus('scheduled');
  const completedShoots = getClientShootsByStatus('completed');
  // Include both 'hold' and 'booked' status for Hold-On tab
  const holdShoots = [
    ...getClientShootsByStatus('hold'),
    ...getClientShootsByStatus('pending')
  ];

  // Apply filters to scheduled shoots
  const filteredScheduledShoots = scheduledShoots.filter(shoot => {
    const matchesAddress = !filterAddress || 
      shoot.location.fullAddress.toLowerCase().includes(filterAddress.toLowerCase());
    
    const matchesPhotographer = !filterPhotographer || 
      shoot.photographer.name === filterPhotographer;
    
    return matchesAddress && matchesPhotographer;
  });

  const handleBookNewShoot = () => {
    navigate('/book-shoot');
  };

  // Format date for display
  const formatShootDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Render shoot card for a single shoot
  const renderShootCard = (shoot: ShootData) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      key={shoot.id}
      className="p-4 border border-border rounded-lg hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
      onClick={() => navigate(`/shoots?id=${shoot.id}`)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium">{shoot.location.address}</h3>
          <p className="text-sm text-muted-foreground">{shoot.location.city}, {shoot.location.state} {shoot.location.zip}</p>
        </div>
        <Badge 
          variant="outline" 
          className={`${
            statusColors[shoot.status as keyof typeof statusColors] || 'bg-gray-500'
          } text-white`}
        >
          {shoot.status.charAt(0).toUpperCase() + shoot.status.slice(1)}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{formatShootDate(shoot.scheduledDate)}</span>
        </div>
        
        {shoot.time && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{shoot.time}</span>
          </div>
        )}
        
        {shoot.photographer && (
          <div className="flex items-center gap-2 col-span-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="truncate">Photographer: {shoot.photographer.name}</span>
          </div>
        )}
        
        {shoot.services && shoot.services.length > 0 && (
          <div className="col-span-2 mt-2">
            <p className="text-xs text-muted-foreground mb-1">Services:</p>
            <div className="flex flex-wrap gap-1">
              {shoot.services.map((service, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" className="gap-1">
          <span>View Details</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );

  // Render table for scheduled shoots
  const renderScheduledShootsTable = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Services</TableHead>
            <TableHead>Photographer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredScheduledShoots.length > 0 ? (
            filteredScheduledShoots.map((shoot) => (
              <TableRow key={shoot.id}>
                <TableCell>{formatShootDate(shoot.scheduledDate)}</TableCell>
                <TableCell>{shoot.time || 'Not set'}</TableCell>
                <TableCell className="max-w-xs truncate">{shoot.location.fullAddress}</TableCell>
                <TableCell>{shoot.services.join(', ')}</TableCell>
                <TableCell>{shoot.photographer.name}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate(`/shoots?id=${shoot.id}`)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center p-4">No scheduled shoots found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  // Render empty state when no shoots are available
  const renderEmptyState = (message: string) => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-xl font-medium mb-2">No shoots to display</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      <Button onClick={handleBookNewShoot}>Book a New Shoot</Button>
    </div>
  );

  // Render loading state
  const renderLoadingState = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-end mt-4">
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="container max-w-5xl py-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Shoots</h1>
            <p className="text-muted-foreground">View and manage your property photo shoots</p>
          </div>
          <Button onClick={handleBookNewShoot}>Book New Shoot</Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="scheduled" className="flex gap-2 items-center">
              <Calendar className="h-4 w-4" />
              <span>Scheduled ({scheduledShoots.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex gap-2 items-center">
              <Eye className="h-4 w-4" />
              <span>Completed ({completedShoots.length})</span>
            </TabsTrigger>
            <TabsTrigger value="hold" className="flex gap-2 items-center">
              <Calendar className="h-4 w-4" />
              <span>Hold-On ({holdShoots.length})</span>
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            renderLoadingState()
          ) : (
            <>
              <TabsContent value="scheduled" className="mt-0">
                {scheduledShoots.length > 0 ? (
                  <>
                    <Collapsible 
                      open={isFilterOpen} 
                      onOpenChange={setIsFilterOpen}
                      className="mb-6 border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Filter Shoots</h3>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Filter className="h-4 w-4 mr-2" />
                            {isFilterOpen ? "Hide Filters" : "Show Filters"}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address-filter">Address</Label>
                            <Input 
                              id="address-filter" 
                              placeholder="Filter by address" 
                              value={filterAddress}
                              onChange={(e) => setFilterAddress(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="photographer-filter">Photographer</Label>
                            <Select 
                              value={filterPhotographer} 
                              onValueChange={setFilterPhotographer}
                            >
                              <SelectTrigger id="photographer-filter">
                                <SelectValue placeholder="Select photographer" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All Photographers</SelectItem>
                                {photographers.map((photographer) => (
                                  <SelectItem key={photographer.name} value={photographer.name}>
                                    {photographer.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {(filterAddress || filterPhotographer) && (
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground">
                              Showing {filteredScheduledShoots.length} of {scheduledShoots.length} shoots
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setFilterAddress('');
                                setFilterPhotographer('');
                              }}
                            >
                              Clear Filters
                            </Button>
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                    {renderScheduledShootsTable()}
                  </>
                ) : (
                  renderEmptyState("You don't have any scheduled shoots. Book your first shoot now!")
                )}
              </TabsContent>
              
              <TabsContent value="completed" className="mt-0">
                {completedShoots.length > 0 ? (
                  <div className="grid gap-4">
                    {completedShoots.map(renderShootCard)}
                  </div>
                ) : (
                  renderEmptyState("You don't have any completed shoots yet.")
                )}
              </TabsContent>
              
              <TabsContent value="hold" className="mt-0">
                {holdShoots.length > 0 ? (
                  <div className="grid gap-4">
                    {holdShoots.map(renderShootCard)}
                  </div>
                ) : (
                  renderEmptyState("You don't have any shoots on hold.")
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ShootHistory;
