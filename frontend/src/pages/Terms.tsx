import { motion } from "framer-motion";

const sections = [
  {
    title: "Acceptance of Terms",
    content: [
      "By accessing and using AuraExpress, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
      "We reserve the right to modify these terms at any time. Your continued use of the website after changes are posted constitutes acceptance of the modified terms.",
    ],
  },
  {
    title: "Account Registration",
    content: [
      "To make purchases, you must create an account and provide accurate, complete information. You are responsible for maintaining the confidentiality of your account credentials.",
      "You must be at least 18 years old to create an account and make purchases. By registering, you represent that you meet this age requirement.",
      "You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use.",
    ],
  },
  {
    title: "Product Information and Pricing",
    content: [
      "We strive to provide accurate product descriptions and pricing. However, we do not warrant that product descriptions, pricing, or other content is accurate, complete, or error-free.",
      "We reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.",
      "All prices are in Indian Rupees (₹) and are subject to change without notice. Prices include applicable taxes unless otherwise stated.",
    ],
  },
  {
    title: "Orders and Payment",
    content: [
      "Placing an order constitutes an offer to purchase products. We reserve the right to accept or decline any order for any reason.",
      "Payment must be received before we process your order. We accept various payment methods as displayed during checkout.",
      "You agree to provide current, complete, and accurate payment information for all purchases.",
    ],
  },
  {
    title: "Shipping and Delivery",
    content: [
      "We will make reasonable efforts to deliver products within the estimated timeframe, but delivery times are not guaranteed.",
      "Risk of loss and title for products pass to you upon delivery to the shipping carrier.",
      "You are responsible for providing accurate shipping information. We are not liable for delays or non-delivery due to incorrect addresses.",
    ],
  },
  {
    title: "Returns and Refunds",
    content: [
      "Our return policy allows returns within 7 days of delivery for most products. Items must be unused and in original packaging.",
      "Certain items are not eligible for return, including intimate wear, perishables, and personalized products.",
      "Refunds will be processed to the original payment method within 5-7 business days after we receive and inspect the returned item.",
    ],
  },
  {
    title: "Intellectual Property",
    content: [
      "All content on this website, including text, graphics, logos, images, and software, is the property of AuraExpress or its licensors and is protected by copyright and trademark laws.",
      "You may not reproduce, distribute, modify, or create derivative works from any content without our express written permission.",
    ],
  },
  {
    title: "User Conduct",
    content: [
      "You agree not to use our website for any unlawful purpose or in any way that could damage, disable, or impair our services.",
      "You may not attempt to gain unauthorized access to any part of the website, other accounts, or computer systems connected to our services.",
      "We reserve the right to terminate or suspend your account for violations of these terms.",
    ],
  },
  {
    title: "Limitation of Liability",
    content: [
      "To the fullest extent permitted by law, AuraExpress shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.",
      "Our total liability for any claim arising from your use of our services shall not exceed the amount you paid for the product or service in question.",
    ],
  },
  {
    title: "Indemnification",
    content: [
      "You agree to indemnify and hold harmless AuraExpress and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your violation of these terms or your use of our services.",
    ],
  },
  {
    title: "Governing Law",
    content: [
      "These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.",
      "Any disputes arising from these terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in Navsari, Gujarat.",
    ],
  },
  {
    title: "Contact Information",
    content: [
      "If you have any questions about these Terms of Service, please contact us at legal@auraexpress.com or +91 72858884304.",
    ],
  },
];

const Terms = () => {
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
              Terms of <span className="text-gradient">Service</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: February 1, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 rounded-2xl bg-card p-8 shadow-sm"
            >
              <p className="text-muted-foreground">
                Welcome to AuraExpress. These Terms of Service govern your use of our website and
                services. By using our website, you agree to comply with and be bound by these
                terms. Please read them carefully.
              </p>
            </motion.div>

            <div className="space-y-12">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <h2 className="mb-4 text-2xl font-bold">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 rounded-2xl bg-secondary/30 p-8"
            >
              <p className="text-sm text-muted-foreground">
                By using AuraExpress, you acknowledge that you have read, understood, and agree to
                be bound by these Terms of Service. Thank you for shopping with us!
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
