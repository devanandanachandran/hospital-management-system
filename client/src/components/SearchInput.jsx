import { Search } from 'lucide-react';

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-400" size={16} />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-3.5 py-2.5 border border-brand-200 rounded-[10px] text-sm bg-white/80 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
      />
    </div>
  );
}

export default SearchInput;