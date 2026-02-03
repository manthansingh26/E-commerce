import { motion } from "framer-motion";
import { Users, Target, Award, Heart } from "lucide-react";

const values = [
  {
    icon: Users,
    title: "Customer First",
    description: "We prioritize customer satisfaction above everything else.",
  },
  {
    icon: Target,
    title: "Quality Products",
    description: "Curated selection of premium products from trusted brands.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Committed to delivering exceptional service and experience.",
  },
  {
    icon: Heart,
    title: "Passion",
    description: "We love what we do and it shows in everything we deliver.",
  },
];

const About = () => {
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
              About <span className="text-gradient">AuraExpress</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Your trusted destination for premium products and exceptional shopping experience
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2026, AuraExpress began with a simple mission: to make premium 
                  shopping accessible to everyone. We believe that quality products shouldn't 
                  come with complicated processes or compromises.
                </p>
                <p>
                  What started as a small online store has grown into a trusted platform 
                  serving thousands of happy customers across India. Our success is built 
                  on three pillars: quality products, exceptional service, and customer trust.
                </p>
                <p>
                  Today, we offer a carefully curated selection of products across multiple 
                  categories, from fashion and electronics to home essentials and more. 
                  Every item in our catalog is handpicked to ensure it meets our high 
                  standards of quality and value.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-primary">
                <div className="flex h-full items-center justify-center p-12">
                  <div className="text-center text-primary-foreground">
                    <p className="mb-4 text-6xl font-bold">50K+</p>
                    <p className="text-xl">Happy Customers</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-secondary/30 py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Our Values</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl bg-card p-6 text-center shadow-sm"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="mb-2 text-5xl font-bold text-gradient">10K+</p>
              <p className="text-muted-foreground">Products Available</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <p className="mb-2 text-5xl font-bold text-gradient">50K+</p>
              <p className="text-muted-foreground">Happy Customers</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="mb-2 text-5xl font-bold text-gradient">4.9</p>
              <p className="text-muted-foreground">Average Rating</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
