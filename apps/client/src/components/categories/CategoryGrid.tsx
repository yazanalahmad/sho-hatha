import { motion } from 'framer-motion';
import type { CategoryData } from '../../state/types';
import { CategoryCard } from './CategoryCard';

interface CategoryGridProps {
  categories?: CategoryData[];
  team1Ids: string[];
  team2Ids: string[];
  onSelect: (categoryId: string) => void;
}

export function CategoryGrid({ categories = [], team1Ids, team2Ids, onSelect }: CategoryGridProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-4 md:grid-cols-3 auto-rows-fr items-stretch"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.07,
          },
        },
      }}
    >
      {categories.map((category) => {
        const selection: 0 | 1 | 2 = team1Ids.includes(category.id) ? 1 : team2Ids.includes(category.id) ? 2 : 0;
        return (
          <motion.div
            key={category.id}
            className="h-full"
            variants={{
              hidden: { scale: 0.9, opacity: 0 },
              show: { scale: 1, opacity: 1 },
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <CategoryCard category={category} selection={selection} onClick={() => onSelect(category.id)} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
