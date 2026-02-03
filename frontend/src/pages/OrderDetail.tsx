import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Truck, CheckCircle, MapPin, X, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const statusConfig = {
  processing: { color: "bg-yellow-500", label: "Processing" },
  confirmed: { color: "bg-purple-500", label: "Confirmed" },
  shipped: { color: "bg-blue-500", label: "Shipped" },
  delivered: { color: "bg-green-500", label: "Delivered" },
  cancelled: { color: "bg-red-500", label: "Cancelled" },
  returned: { color: "bg-orange-500", label: "Returned" },
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnComments, setReturnComments] = useState("");

  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(orderId);
      setOrder(data);
    } catch (error: any) {
      console.error('Failed to fetch order:', error);
      toast.error("Failed to load order", {
        description: error.response?.data?.message || "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const canCancelOrder = (status: string) => {
    return status === 'processing' || status === 'confirmed';
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!order) return;

    try {
      setCancelling(true);
      await orderService.cancelOrder(order.id);
      toast.success("Order cancelled successfully");
      
      // Refresh order data
      await fetchOrder(order.id);
      setShowCancelDialog(false);
    } catch (error: any) {
      toast.error("Failed to cancel order", {
        description: error.response?.data?.message || "Please try again"
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    
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

  const canReturnOrder = (status: string, updatedAt: string) => {
    if (status !== 'delivered') return false;
    
    // Check if within 7 days of delivery
    const deliveryDate = new Date(updatedAt);
    const currentDate = new Date();
    const daysSinceDelivery = Math.floor((currentDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceDelivery <= 7;
  };

  const handleReturnClick = () => {
    setShowReturnDialog(true);
  };

  const handleReturnConfirm = async () => {
    if (!order) return;

    if (!returnReason) {
      toast.error("Please select a return reason");
      return;
    }

    try {
      setReturning(true);
      await orderService.returnOrder(order.id, returnReason, returnComments);
      toast.success("Return request submitted successfully", {
        description: "Refund will be processed within 5-7 business days"
      });
      
      // Refresh order data
      await fetchOrder(order.id);
      setShowReturnDialog(false);
      setReturnReason("");
      setReturnComments("");
    } catch (error: any) {
      toast.error("Failed to submit return request", {
        description: error.response?.data?.message || "Please try again"
      });
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">Order Not Found</h1>
        <Link to="/orders">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];

  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="border-b bg-secondary/30 py-8">
        <div className="container">
          <Link to="/orders">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Order {order.orderNumber}</h1>
              <p className="text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card p-6 shadow-sm"
            >
              <h2 className="mb-6 text-xl font-semibold">Order Tracking</h2>
              <div className="space-y-0">
                {/* Processing */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      ['processing', 'confirmed', 'shipped', 'delivered'].includes(order.status)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <Package className="h-5 w-5" />
                    </div>
                    {order.status !== 'processing' && order.status !== 'cancelled' && (
                      <div className={`w-0.5 h-16 ${
                        ['confirmed', 'shipped', 'delivered'].includes(order.status)
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your order has been received and is being processed
                    </p>
                  </div>
                </div>

                {/* Confirmed */}
                {order.status !== 'cancelled' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        ['confirmed', 'shipped', 'delivered'].includes(order.status)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      {order.status !== 'confirmed' && order.status !== 'processing' && (
                        <div className={`w-0.5 h-16 ${
                          ['shipped', 'delivered'].includes(order.status)
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <p className={`font-medium ${
                        ['confirmed', 'shipped', 'delivered'].includes(order.status)
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        Order Confirmed
                      </p>
                      {['confirmed', 'shipped', 'delivered'].includes(order.status) ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.updatedAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your order has been confirmed and is being prepared for shipment
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Pending confirmation
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Shipped */}
                {order.status !== 'cancelled' && order.status !== 'processing' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        ['shipped', 'delivered'].includes(order.status)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Truck className="h-5 w-5" />
                      </div>
                      {order.status !== 'shipped' && (
                        <div className={`w-0.5 h-16 ${
                          order.status === 'delivered'
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <p className={`font-medium ${
                        ['shipped', 'delivered'].includes(order.status)
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        Order Shipped
                      </p>
                      {['shipped', 'delivered'].includes(order.status) ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.updatedAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Your order is on the way to your delivery address
                          </p>
                          {order.status === 'shipped' && (
                            <p className="text-xs text-primary mt-2 font-medium">
                              Expected delivery: {new Date(new Date(order.updatedAt).getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Awaiting shipment
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivered */}
                {order.status !== 'cancelled' && order.status !== 'processing' && order.status !== 'confirmed' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        order.status === 'delivered'
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        Order Delivered
                      </p>
                      {order.status === 'delivered' ? (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.updatedAt).toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 mt-1 font-medium">
                            ✓ Your order has been successfully delivered
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Pending delivery
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancelled */}
                {order.status === 'cancelled' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white">
                        <X className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-red-600">Order Cancelled</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.updatedAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This order has been cancelled. Refund will be processed within 5-7 business days.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-card p-6 shadow-sm"
            >
              <h2 className="mb-6 text-xl font-semibold">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.productName}</h3>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="mt-1 font-semibold">₹{item.subtotal.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{order.shippingFullName}</p>
                <p>{order.shippingAddress}</p>
                <p>
                  {order.shippingCity}, {order.shippingState}
                </p>
                <p>{order.shippingZipCode}</p>
                <p>{order.shippingPhone}</p>
              </div>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-card p-6 shadow-sm"
            >
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shippingCost === 0 ? "Free" : `₹${order.shippingCost.toLocaleString()}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (GST)</span>
                  <span>₹{order.tax.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₹{order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              {canCancelOrder(order.status) && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleCancelClick}
                  disabled={cancelling}
                >
                  <X className="mr-2 h-4 w-4" />
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleDownloadInvoice}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
              {canReturnOrder(order.status, order.updatedAt) && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleReturnClick}
                  disabled={returning}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  {returning ? "Processing..." : "Return Order"}
                </Button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel order <strong>{order.orderNumber}</strong>? 
                This action cannot be undone. If payment was made, refund will be processed 
                within 5-7 business days.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={cancelling}>No, Keep Order</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleCancelConfirm} 
                disabled={cancelling}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Return Order Dialog */}
        <AlertDialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Return Order</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide a reason for returning order <strong>{order.orderNumber}</strong>. 
                Returns are accepted within 7 days of delivery.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="return-reason">Return Reason *</Label>
                <Select value={returnReason} onValueChange={setReturnReason}>
                  <SelectTrigger id="return-reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="defective">Product is defective</SelectItem>
                    <SelectItem value="wrong-item">Wrong item received</SelectItem>
                    <SelectItem value="not-as-described">Not as described</SelectItem>
                    <SelectItem value="damaged">Damaged during shipping</SelectItem>
                    <SelectItem value="changed-mind">Changed my mind</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="return-comments">Additional Comments (Optional)</Label>
                <Textarea
                  id="return-comments"
                  placeholder="Please provide any additional details..."
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={returning}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleReturnConfirm} 
                disabled={returning || !returnReason}
              >
                {returning ? "Submitting..." : "Submit Return Request"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default OrderDetail;
