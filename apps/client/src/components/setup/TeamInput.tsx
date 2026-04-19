interface TeamInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TeamInput({ label, value, onChange, error }: TeamInputProps) {
  return (
    <label className="block w-full">
      <span className="font-display text-xl text-gold block mb-2">{label}</span>
      <input
        className="w-full bg-transparent border-0 border-b border-gold-muted py-2 text-lg text-ivory focus:outline-none focus:border-gold"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <span className="text-wrong text-sm mt-1 block">{error}</span> : null}
    </label>
  );
}
