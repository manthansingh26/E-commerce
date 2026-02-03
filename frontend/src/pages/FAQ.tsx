import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const faqs = [
  {
    category: "Orders & Shipping",
    questions: [
      {
        question: "How long does shipping take?",
        answer:
          "Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 business days delivery. Free shipping is available on orders above ₹999.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Yes! Once your order ships, you'll receive a tracking number via email. You can also track your order from the Orders page in your account.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Currently, we only ship within India. We're working on expanding to international shipping soon.",
      },
      {
        question: "What if my order arrives damaged?",
        answer:
          "We're sorry if that happens! Please contact our support team within 48 hours of delivery with photos of the damage, and we'll arrange a replacement or refund.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 7-day hassle-free return policy. Items must be unused, in original packaging, and with all tags attached. Some items like intimate wear and perishables are not eligible for returns.",
      },
      {
        question: "How do I initiate a return?",
        answer:
          "Go to your Orders page, select the order you want to return, and click 'Request Return'. Our team will review and approve your request within 24 hours.",
      },
      {
        question: "When will I receive my refund?",
        answer:
          "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.",
      },
      {
        question: "Can I exchange an item?",
        answer:
          "Yes! You can exchange items for a different size or color. Simply initiate a return and place a new order for the item you want.",
      },
    ],
  },
  {
    category: "Payment & Security",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit/debit cards, UPI, net banking, and popular digital wallets. All payments are processed securely through encrypted channels.",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Absolutely! We use industry-standard SSL encryption and never store your complete card details. All transactions are processed through secure payment gateways.",
      },
      {
        question: "Can I pay cash on delivery?",
        answer:
          "Cash on delivery is available for orders under ₹5,000. A small COD fee may apply depending on your location.",
      },
      {
        question: "Do you offer EMI options?",
        answer:
          "Yes! EMI options are available on orders above ₹3,000 through select credit cards and payment partners.",
      },
    ],
  },
  {
    category: "Account & Profile",
    questions: [
      {
        question: "How do I create an account?",
        answer:
          "Click on the 'Register' button in the top right corner, enter your details, and verify your email with the OTP sent to you. It's quick and easy!",
      },
      {
        question: "I forgot my password. What should I do?",
        answer:
          "Click on 'Forgot Password' on the login page, enter your email, and we'll send you instructions to reset your password.",
      },
      {
        question: "Can I change my email address?",
        answer:
          "Yes, you can update your email address from your Profile page. You'll need to verify the new email with an OTP.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "We're sad to see you go! Please contact our support team to request account deletion. Note that this action is permanent and cannot be undone.",
      },
    ],
  },
  {
    category: "Products & Availability",
    questions: [
      {
        question: "How do I know if a product is in stock?",
        answer:
          "Product availability is shown on each product page. If an item is out of stock, you can sign up for notifications when it's back in stock.",
      },
      {
        question: "Are your products authentic?",
        answer:
          "Yes! We source all products directly from authorized distributors and brands. Every product comes with authenticity guarantee.",
      },
      {
        question: "Can I pre-order upcoming products?",
        answer:
          "Pre-orders are available for select products. Check the product page for pre-order availability and expected delivery dates.",
      },
      {
        question: "Do you offer gift wrapping?",
        answer:
          "Yes! Gift wrapping is available for ₹99 per item. You can add this option during checkout.",
      },
    ],
  },
];

const FAQ = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Find answers to common questions about shopping with AuraExpress
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl space-y-12">
            {faqs.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <h2 className="mb-6 text-2xl font-bold">{category.category}</h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.questions.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      value={`${categoryIndex}-${index}`}
                      className="rounded-xl border bg-card px-6 shadow-sm"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary/30 py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="mb-4 text-3xl font-bold">Still have questions?</h2>
            <p className="mb-8 text-muted-foreground">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <Link to="/contact">
              <Button size="lg">Contact Support</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
