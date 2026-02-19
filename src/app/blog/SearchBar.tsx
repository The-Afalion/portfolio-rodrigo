"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
        placeholder="Buscar artículos..."
        defaultValue={searchParams.get('q')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
