import { motion } from 'framer-motion';

interface AnswerGridProps {
  options: string[];
  removedOptionIndices: number[];
  disabled: boolean;
  revealCorrectIndex: number | null;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function AnswerGrid({
  options,
  removedOptionIndices,
  disabled,
  revealCorrectIndex,
  selectedIndex,
  onSelect,
}: AnswerGridProps) {
  const letters = ['A', 'B', 'C', 'D'];
  const safeOptions = Array.isArray(options) ? options.slice(0, 4) : [];

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.1 },
        },
      }}
      initial="hidden"
      animate="show"
    >
      {safeOptions.map((option, index) => {
        const removed = removedOptionIndices.includes(index);
        const isCorrect = revealCorrectIndex === index;
        const isWrong = selectedIndex === index && selectedIndex !== revealCorrectIndex;
        return (
          <motion.button
            key={`${option}-${index}`}
            type="button"
            className={[
              'answer-btn',
              'bg-bg-card border border-gold-muted text-ivory rounded px-4 py-4 text-left flex gap-3 items-center transition-transform',
              'hover:translate-x-[3px] hover:border-gold',
              removed ? 'opacity-20 pointer-events-none' : '',
              isCorrect ? 'border-correct bg-[rgba(45,216,135,0.12)] shadow-[0_0_20px_rgba(45,216,135,0.3)]' : '',
              isWrong ? 'border-wrong bg-[rgba(255,71,87,0.1)]' : '',
            ].join(' ')}
            onClick={() => onSelect(index)}
            disabled={disabled || removed}
            variants={{
              hidden: { opacity: 0, y: 15 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            aria-label={`Answer ${letters[index]}`}
          >
            <span className="font-display text-lg text-gold min-w-6">{letters[index]}</span>
            <span className="text-xl">{option}</span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
