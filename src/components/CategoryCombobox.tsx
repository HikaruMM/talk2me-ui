import React, { useState, useRef, useEffect } from 'react';
import { Category } from '../types';
import { ChevronDown, Check, Plus, X } from 'lucide-react';

interface CategoryComboboxProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onCreateNewCategory: (newCategoryName: string) => void;
}

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateNewCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasExactMatch = categories.some(
    (cat) => cat.name.toLowerCase() === searchTerm.trim().toLowerCase()
  );

  const handleCreate = () => {
    if (searchTerm.trim()) {
      onCreateNewCategory(searchTerm.trim());
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="block text-xs font-bold text-[#1B1F2E] dark:text-[#F1F5F9] mb-1.5 uppercase tracking-wider">
        Course Category
      </label>

      {/* Selected Chip or Input Container */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[48px] px-3 py-2 rounded-2xl bg-[#F1F4F9] dark:bg-[#273449] border border-[#E4E8F0] dark:border-[#334155] focus-within:ring-2 focus-within:ring-[#2E68FF] flex items-center justify-between cursor-pointer transition-all"
      >
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {selectedCategory ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAF1FF] dark:bg-[#1A2540] text-[#2E68FF] dark:text-[#5B8CFF] border border-blue-200/50 dark:border-blue-800/40">
              <span className="w-2 h-2 rounded-full bg-[#2E68FF]" />
              <span>{selectedCategory.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCategory('');
                }}
                className="hover:text-red-500 p-0.5 rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ) : (
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              placeholder="Select or type to create category..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#1B1F2E] dark:text-[#F1F5F9] border-none focus:outline-none placeholder-[#95A0B4]"
            />
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-[#95A0B4] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E4E8F0] dark:border-[#334155] shadow-xl max-h-60 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Search Input when a chip is selected */}
          {selectedCategory && (
            <div className="p-1.5 mb-1 border-b border-[#E4E8F0] dark:border-[#334155]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to filter..."
                className="w-full px-3 py-1.5 text-xs rounded-xl bg-[#F1F4F9] dark:bg-[#273449] border-none focus:outline-none"
              />
            </div>
          )}

          {/* List items */}
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat) => {
              const isSelected = cat.id === selectedCategoryId;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#EAF1FF] dark:bg-[#1A2540] text-[#2E68FF]'
                      : 'hover:bg-[#F1F4F9] dark:hover:bg-[#273449] text-[#1B1F2E] dark:text-[#F1F5F9]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color || '#2E68FF' }} />
                    <span>{cat.name}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#2E68FF]" />}
                </div>
              );
            })
          ) : (
            <div className="p-2 text-xs text-[#95A0B4] text-center">No categories matching</div>
          )}

          {/* Inline Create Option */}
          {searchTerm.trim() && !hasExactMatch && (
            <div
              onClick={handleCreate}
              className="mt-1 pt-1 border-t border-[#E4E8F0] dark:border-[#334155] flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#2E68FF] hover:bg-[#EAF1FF] dark:hover:bg-[#1A2540] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create "{searchTerm.trim()}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
