interface TimerSelectorProps {
  options: number[];
  selected: number | null;
  onSelect: (value: number) => void;
}

export function TimerSelector({ options, selected, onSelect }: TimerSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`px-5 py-2 border font-score text-lg ${selected === option ? 'bg-gold border-gold text-bg-base' : 'border-gold-muted text-ivory'}`}
          onClick={() => onSelect(option)}
        >
          {option}s
        </button>
      ))}
    </div>
  );
}
