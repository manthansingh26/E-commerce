import { motion } from "framer-motion";

const sections = [
  {
    title: "Information We Collect",
    content: [
      "We collect information you provide directly to us when you create an account, make a purchase, or contact us. This includes your name, email address, phone number, shipping address, and payment information.",
      "We also automatically collect certain information about your device and how you interact with our website, including IP address, browser type, pages visited, and time spent on pages.",
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      "We use the information we collect to process your orders, communicate with you about your purchases, and provide customer support.",
      "We may also use your information to send you marketing communications about our products and services, but you can opt out of these at any time.",
      "Your information helps us improve our website, personalize your shopping experience, and detect and prevent fraud.",
    ],
  },
  {
    title: "Information Sharing",
    content: [
      "We do not sell your personal information to third parties. We may share your information with service providers who help us operate our business, such as payment processors and shipping companies.",
      "We may also share information when required by law or to protect our rights and the safety of our users.",
    ],
  },
  {
    title: "Data Security",
    content: [
      "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.",
      "All payment information is encrypted using SSL technology and processed through secure payment gateways. We never store complete credit card details on our servers.",
    ],
  },
  {
    title: "Your Rights",
    content: [
      "You have the right to access, update, or delete your personal information at any time through your account settings.",
      "You can opt out of marketing communications by clicking the unsubscribe link in our emails or updating your preferences in your account.",
      "If you have any concerns about how we handle your data, please contact us at privacy@auraexpress.com.",
    ],
  },
  {
    title: "Cookies",
    content: [
      "We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content.",
      "You can control cookies through your browser settings, but disabling cookies may affect your ability to use certain features of our website.",
    ],
  },
  {
    title: "Children's Privacy",
    content: [
      "Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.",
      "If you believe we have collected information from a child under 13, please contact us immediately.",
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last Updated' date.",
      "We encourage you to review this policy periodically to stay informed about how we protect your information.",
    ],
  },
];

const Privacy = () => {
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
              Privacy <span className="text-gradient">Policy</span>
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
                At AuraExpress, we take your privacy seriously. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you visit our website
                and use our services. Please read this policy carefully.
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
                  <h2 className="mb-4 text-2xl font-bold">{section.title}</h2>
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
              <h2 className="mb-4 text-2xl font-bold">Contact Us</h2>
              <p className="mb-4 text-muted-foreground">
                If you have any questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: privacy@auraexpress.com</p>
                <p>Phone: +91 72858884304</p>
                <p>Address: Navsari, Gujarat, India</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
