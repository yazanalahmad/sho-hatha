import { motion } from 'framer-motion';

export function QuestionCard({ text }: { text: string }) {
  return (
    <motion.div
      className="card p-6"
      initial={{ rotateX: 15, opacity: 0, y: 10 }}
      animate={{ rotateX: 0, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-[2rem] leading-tight">{text}</p>
    </motion.div>
  );
}
