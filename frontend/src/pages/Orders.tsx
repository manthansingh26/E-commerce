import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Calendar, CreditCard, MapPin, X, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { orderService, Order } from "@/services/order.service";
import { toast } from "sonner";
import { generateInvoice } from "@/utils/invoice";

const statusColors = {
  delivered: "bg-green-500",
  shipped: "bg-blue-500",
  processing: "bg-yellow-500",
  confirmed: "bg-purple-500",
  cancelled: "bg-red-500",
  returned: "bg-orange-500",
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getUserOrders();
      setOrders(data);
    } catch (error: any) {
      console.error('Failed to fetch orders:', error);
      toast.error("Failed to load orders", {
        description: error.response?.data?.message || "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (orderId: string) => {
    setCancellingOrderId(orderId);
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancellingOrderId) return;

    try {
      await orderService.cancelOrder(cancellingOrderId);
      toast.success("Order cancelled successfully");
      fetchOrders(); // Refresh orders
    } catch (error: any) {
      toast.error("Failed to cancel order", {
        description: error.response?.data?.message || "Please try again"
      });
    } finally {
      setShowCancelDialog(false);
      setCancellingOrderId(null);
    }
  };

  const canCancelOrder = (status: string) => {
    return status === 'processing' || status === 'confirmed';
  };

  const handleDownloadInvoice = (order: Order) => {
    try {
      generateInvoice(order);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      toast.error("Failed to download invoice", {
        description: "Please try again later"
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            View and track your order history
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">
                Start shopping to see your orders here
              </p>
              <Button asChild>
                <Link to="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg mb-2">
                          Order {order.orderNumber}
                        </CardTitle>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            ₹{order.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`${
                          statusColors[order.status as keyof typeof statusColors]
                        } text-white`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Products */}
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between items-center py-2 border-b last:border-0"
                          >
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <p className="font-semibold">
                              ₹{item.subtotal.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Address */}
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                        <div>
                          <p className="font-medium mb-1">Shipping Address</p>
                          <p className="text-muted-foreground">
                            {order.shippingAddress}, {order.shippingCity}, {order.shippingState} {order.shippingZipCode}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/orders/${order.id}`}>View Details</Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadInvoice(order)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Invoice
                        </Button>
                        {canCancelOrder(order.status) && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelClick(order.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel Order
                          </Button>
                        )}
                        {order.status === "delivered" && (
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        )}
                        {order.status === "shipped" && (
                          <Button variant="outline" size="sm">
                            Track Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone.
                If payment was made, refund will be processed within 5-7 business days.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </div>
  );
};

export default Orders;
