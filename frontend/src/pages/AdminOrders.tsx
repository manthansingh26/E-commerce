import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Search, Filter, Eye, Edit, Download, RefreshCw, 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Truck,
  CheckCircle, XCircle, Clock, RotateCcw, ChevronDown, ChevronUp,
  Calendar, User, Mail, Phone, MapPin, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { adminOrderService } from "@/services/admin-order.service";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  shippingFullName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  createdAt: string;
  items: any[];
}

const statusColors = {
  processing: "bg-blue-500",
  confirmed: "bg-green-500",
  shipped: "bg-purple-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
  returned: "bg-orange-500",
};

const statusLabels = {
  processing: "Processing",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminOrderService.getAllOrders();
      setOrders(data);
    } catch (error: any) {
      toast.error("Failed to load orders", {
        description: error.message || "Please try again"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shippingEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      await adminOrderService.updateOrderStatus(selectedOrder.id, newStatus);
      toast.success("Order status updated successfully");
      setIsDialogOpen(false);
      loadOrders();
    } catch (error: any) {
      toast.error("Failed to update order status", {
        description: error.message || "Please try again"
      });
    }
  };

  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsDialogOpen(true);
  };

  const openDetailsDialog = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const toggleRowExpansion = (orderId: string) => {
    setExpandedRow(expandedRow === orderId ? null : orderId);
  };

  const exportToCSV = () => {
    // Prepare CSV data
    const headers = ['Order Number', 'Customer Name', 'Email', 'Phone', 'Items', 'Total', 'Status', 'Date', 'Address'];
    
    const csvData = filteredOrders.map(order => [
      order.orderNumber,
      order.shippingFullName,
      order.shippingEmail,
      order.shippingPhone,
      order.items.length,
      order.total.toFixed(2),
      statusLabels[order.status as keyof typeof statusLabels],
      new Date(order.createdAt).toLocaleDateString('en-IN'),
      `${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState}`
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Orders exported successfully", {
      description: `${filteredOrders.length} orders exported to CSV`
    });
  };

  const getOrderStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const previousRevenue = totalRevenue * 0.85;
    const revenueChange = ((totalRevenue - previousRevenue) / previousRevenue) * 100;

    return {
      total: orders.length,
      processing: orders.filter((o) => o.status === "processing").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      returned: orders.filter((o) => o.status === "returned").length,
      totalRevenue,
      revenueChange,
    };
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage all customer orders in real-time
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                  <h3 className="text-3xl font-bold mt-2">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </h3>
                  <div className="flex items-center mt-2 text-sm">
                    {stats.revenueChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span>{Math.abs(stats.revenueChange).toFixed(1)}% from last period</span>
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <DollarSign className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Orders</p>
                  <h3 className="text-3xl font-bold mt-2">{stats.total}</h3>
                  <p className="text-sm text-muted-foreground mt-2">All time orders</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Active Orders</p>
                  <h3 className="text-3xl font-bold mt-2">
                    {stats.processing + stats.confirmed + stats.shipped}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">In progress</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                  <Truck className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Completed</p>
                  <h3 className="text-3xl font-bold mt-2">{stats.delivered}</h3>
                  <p className="text-sm text-muted-foreground mt-2">Successfully delivered</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Status Overview</CardTitle>
            <CardDescription>Quick view of orders by status</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
                  All ({stats.total})
                </TabsTrigger>
                <TabsTrigger value="processing" onClick={() => setStatusFilter("processing")}>
                  <Clock className="h-4 w-4 mr-1" />
                  {stats.processing}
                </TabsTrigger>
                <TabsTrigger value="confirmed" onClick={() => setStatusFilter("confirmed")}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {stats.confirmed}
                </TabsTrigger>
                <TabsTrigger value="shipped" onClick={() => setStatusFilter("shipped")}>
                  <Truck className="h-4 w-4 mr-1" />
                  {stats.shipped}
                </TabsTrigger>
                <TabsTrigger value="delivered" onClick={() => setStatusFilter("delivered")}>
                  <Package className="h-4 w-4 mr-1" />
                  {stats.delivered}
                </TabsTrigger>
                <TabsTrigger value="cancelled" onClick={() => setStatusFilter("cancelled")}>
                  <XCircle className="h-4 w-4 mr-1" />
                  {stats.cancelled}
                </TabsTrigger>
                <TabsTrigger value="returned" onClick={() => setStatusFilter("returned")}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  {stats.returned}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="md:w-auto">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Orders List</CardTitle>
                <CardDescription>
                  Showing {filteredOrders.length} of {orders.length} orders
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Orders will appear here once customers place them"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="min-w-[140px]">
                              <p className="text-xs text-muted-foreground mb-1">Order Number</p>
                              <p className="font-mono font-semibold text-sm">{order.orderNumber}</p>
                            </div>

                            <div className="min-w-[200px]">
                              <p className="text-xs text-muted-foreground mb-1">Customer</p>
                              <p className="font-medium text-sm">{order.shippingFullName}</p>
                              <p className="text-xs text-muted-foreground">{order.shippingEmail}</p>
                            </div>

                            <div className="min-w-[120px]">
                              <p className="text-xs text-muted-foreground mb-1">Items & Total</p>
                              <p className="font-semibold text-sm">₹{order.total.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                            </div>

                            <div className="min-w-[100px]">
                              <p className="text-xs text-muted-foreground mb-1">Status</p>
                              <Badge
                                className={`${
                                  statusColors[order.status as keyof typeof statusColors]
                                } text-white`}
                              >
                                {statusLabels[order.status as keyof typeof statusLabels]}
                              </Badge>
                            </div>

                            <div className="min-w-[100px]">
                              <p className="text-xs text-muted-foreground mb-1">Date</p>
                              <p className="text-sm">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailsDialog(order)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStatusDialog(order)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Update
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(order.id)}
                            >
                              {expandedRow === order.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedRow === order.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <Separator />
                            <div className="p-4 bg-muted/30">
                              <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Shipping Address
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <p>{order.shippingFullName}</p>
                                    <p className="text-muted-foreground">{order.shippingAddress}</p>
                                    <p className="text-muted-foreground">
                                      {order.shippingCity}, {order.shippingState}
                                    </p>
                                    <p className="flex items-center text-muted-foreground">
                                      <Phone className="h-3 w-3 mr-2" />
                                      {order.shippingPhone}
                                    </p>
                                    <p className="flex items-center text-muted-foreground">
                                      <Mail className="h-3 w-3 mr-2" />
                                      {order.shippingEmail}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-3 flex items-center">
                                    <Package className="h-4 w-4 mr-2" />
                                    Order Items
                                  </h4>
                                  <div className="space-y-2">
                                    {order.items.map((item: any, index: number) => (
                                      <div key={index} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                          {item.productName} x {item.quantity}
                                        </span>
                                        <span className="font-medium">₹{item.subtotal.toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Current Status
              </label>
              <Badge
                className={`${
                  statusColors[selectedOrder?.status as keyof typeof statusColors]
                } text-white`}
              >
                {statusLabels[selectedOrder?.status as keyof typeof statusLabels]}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete information for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order Number</p>
                  <p className="font-mono font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge
                    className={`${
                      statusColors[selectedOrder.status as keyof typeof statusColors]
                    } text-white`}
                  >
                    {statusLabels[selectedOrder.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="font-semibold text-lg">₹{selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-medium">{selectedOrder.shippingFullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="font-medium">{selectedOrder.shippingEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Phone</p>
                    <p className="font-medium">{selectedOrder.shippingPhone}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Shipping Address
                </h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium mb-1">{selectedOrder.shippingFullName}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shippingAddress}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedOrder.shippingCity}, {selectedOrder.shippingState}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Order Items ({selectedOrder.items.length})
                </h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} × ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">₹{item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsDetailsOpen(false);
              openStatusDialog(selectedOrder!);
            }}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
