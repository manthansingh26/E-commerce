import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Category } from "@/types/product";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  index?: number;
}

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Link
        to={`/products?category=${category.slug}`}
        className="group relative block overflow-hidden rounded-2xl"
      >
        <div className="aspect-square overflow-hidden">
          <img
            src={category.image}
            alt={category.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="mb-1 text-lg font-bold text-white">{category.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/80">
              {category.productCount} Products
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-white transition-transform group-hover:translate-x-1">
              Shop Now <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
