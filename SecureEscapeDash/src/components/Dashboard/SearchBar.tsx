import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search customer, email, case ID, severity or alert...",
}: SearchBarProps) {
  return (
    <div className="border border-[#D5E1EB] bg-white shadow-sm">
      <div className="flex items-center">
        <div className="flex h-[54px] w-14 shrink-0 items-center justify-center border-r border-[#E5EDF3] bg-[#F4F8FB] text-[#1769AA]">
          <Search size={19} strokeWidth={1.8} />
        </div>

        <input
          type="search"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          autoComplete="off"
          className="h-[54px] min-w-0 flex-1 bg-white px-4 text-sm text-[#102A43] outline-none placeholder:text-slate-400"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="mr-3 flex h-8 w-8 items-center justify-center text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X size={17} />
          </button>
        )}
      </div>
    </div>
  );
}
