import { useMemo, useRef, useState } from "react";
import type { SearchResult } from "../../interfaces/map.interface";

interface SearchBarProps {
  items: SearchResult[];
  onSelect: (item: SearchResult) => void;
}

export function SearchBar({ items, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? items.filter((item) => item.name.toLowerCase().includes(normalized)).slice(0, 8) : [];
  }, [items, query]);

  return (
    <div className="search-bar">
      <div className="search-bar__field">
        <span aria-hidden="true">⌕</span>
        <input ref={inputRef} type="search" placeholder="Search location..." value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setFocused(true)} onBlur={() => window.setTimeout(() => setFocused(false), 120)} aria-label="Search District / Block / Village / Road" />
      </div>
      {focused && query.trim() && <div className="search-bar__results">
        {results.length === 0 && <div className="search-bar__empty">No matches for &ldquo;{query}&rdquo;</div>}
        {results.map((item) => <button key={`${item.kind}-${item.id}`} className="search-bar__result" onMouseDown={(event) => event.preventDefault()} onClick={() => { onSelect(item); setQuery(item.name); setFocused(false); inputRef.current?.blur(); }}><strong>{item.name}</strong><span>{item.type}</span></button>)}
      </div>}
    </div>
  );
}
