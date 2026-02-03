import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CreditCard, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { orderService } from "@/services/order.service";
import { useCart } from "@/contexts/CartContext";

const TestPayment = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    // Load pending order from localStorage
    const pendingOrder = localStorage.getItem('pendingOrder');
    if (pendingOrder) {
      setOrderData(JSON.parse(pendingOrder));
    } else {
      toast.error("No pending order found");
      navigate('/checkout');
    }
  }, [navigate]);

  // Test card details
  const TEST_CARD = {
    number: "4242424242424242",
    expiry: "10/26",
    cvv: "231",
    name: "ARYAN"
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiryDate(formatExpiryDate(value));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const fillTestCard = () => {
    setCardNumber(formatCardNumber(TEST_CARD.number));
    setExpiryDate(TEST_CARD.expiry);
    setCvv(TEST_CARD.cvv);
    setCardName(TEST_CARD.name);
    toast.success("Test card details filled!");
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    if (!cardNumber || !expiryDate || !cvv || !cardName) {
      toast.error("Please fill all fields");
      return;
    }

    const cleanCardNumber = cardNumber.replace(/\s/g, '');

    // Check if using test card
    if (cleanCardNumber === TEST_CARD.number) {
      setProcessing(true);

      // Simulate payment processing
      setTimeout(async () => {
        try {
          // Create order after successful payment
          console.log('💳 Payment successful, creating order...');
          const order = await orderService.createOrder(orderData);
          
          console.log('✅ Order created:', order);
          setOrderNumber(order.orderNumber);
          setProcessing(false);
          setPaymentSuccess(true);
          
          // Clear pending order from localStorage
          localStorage.removeItem('pendingOrder');
          
          // Clear cart
          clearCart();
          
          toast.success("Payment Successful!", {
            description: `Order ${order.orderNumber} has been placed successfully`
          });
        } catch (error: any) {
          console.error('❌ Order creation failed:', error);
          setProcessing(false);
          toast.error("Order creation failed", {
            description: error.response?.data?.message || "Please try again"
          });
        }
      }, 2000);
    } else {
      toast.error("Invalid card", {
        description: "Please use the test card: 4242 4242 4242 4242"
      });
    }
  };

  const resetForm = () => {
    navigate('/orders');
  };

  if (!orderData) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-green-100 p-6">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground mb-6">
                Your order has been placed successfully.
              </p>
              <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm font-mono">Order Number: {orderNumber}</p>
                <p className="text-sm text-muted-foreground mt-1">Amount: ₹{orderData?.total.toFixed(2)}</p>
              </div>
              <Button onClick={resetForm} className="w-full">
                View My Orders
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Button
          variant="ghost"
          onClick={() => navigate('/checkout')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Checkout
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Payment</h1>
          <p className="text-muted-foreground">
            Secure test payment gateway
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Test Card Info */}
          <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">Test Card Details</CardTitle>
              <CardDescription className="text-blue-100">
                Use these details for testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-blue-100">Card Number</p>
                <p className="font-mono text-lg">4242 4242 4242 4242</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-100">Expiry Date</p>
                  <p className="font-mono">10/26</p>
                </div>
                <div>
                  <p className="text-sm text-blue-100">CVV</p>
                  <p className="font-mono">231</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-blue-100">Cardholder Name</p>
                <p className="font-mono">ARYAN</p>
              </div>
              <Button 
                onClick={fillTestCard}
                variant="secondary"
                className="w-full mt-4"
              >
                Auto-Fill Test Card
              </Button>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
              <CardDescription>
                Enter card information to process payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={handleExpiryChange}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={handleCvvChange}
                      maxLength={3}
                      type="password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="JOHN DOE"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Amount to Pay</span>
                    <span className="text-2xl font-bold">₹{orderData?.total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {orderData?.items.length} item(s) • Shipping: {orderData?.shippingCost === 0 ? 'Free' : `₹${orderData?.shippingCost}`}
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={processing}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Pay ₹{orderData?.total.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  🔒 Secure test payment - No real charges will be made
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Click "Auto-Fill Test Card" to automatically populate the form</p>
            <p>• Only the test card number (4242 4242 4242 4242) will be accepted</p>
            <p>• Any future expiry date (e.g., 10/26) will work</p>
            <p>• Any 3-digit CVV (e.g., 231) will work</p>
            <p>• Any name can be used (e.g., ARYAN)</p>
            <p>• Payment processing is simulated and takes 2 seconds</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TestPayment;
