import { useEffect, useRef, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  StyledTrigger,
  TriggerLabel,
  StyledPopoverContent,
  StyledCommand,
  SearchRow,
  StyledCommandInput,
  StyledCommandList,
  EmptyState,
  StyledCommandItem,
  ItemCheck,
} from "./Combobox.styles";

// How long the search box waits after the last keystroke before it
// actually re-filters the list — deliberately short, since filtering is a
// plain in-memory array scan (no network round trip to debounce against),
// but a little debounce still keeps a fast typist from re-rendering the
// list on every single keystroke.
const SEARCH_DEBOUNCE_MS = 120;

export interface ComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
}

export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  emptyMessage = "No matches found",
  invalid = false,
  disabled = false,
  id,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const query = debouncedSearch.trim().toLowerCase();
  const filteredOptions = query
    ? options.filter((option) => option.toLowerCase().includes(query))
    : options;

  const handleSelect = (option: string) => {
    onValueChange(option);
    setOpen(false);
    setSearchInput("");
    setDebouncedSearch("");
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSearchInput("");
      setDebouncedSearch("");
    }
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <StyledTrigger
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          data-placeholder={!value}
          $invalid={invalid}
          disabled={disabled}
        >
          <TriggerLabel>{value || placeholder}</TriggerLabel>
          <ChevronDown size={16} />
        </StyledTrigger>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <StyledPopoverContent align="start" sideOffset={4}>
          <StyledCommand shouldFilter={false}>
            <SearchRow>
              <Search size={14} />
              <StyledCommandInput
                value={searchInput}
                onValueChange={setSearchInput}
                placeholder={searchPlaceholder}
              />
            </SearchRow>
            <StyledCommandList>
              {filteredOptions.length === 0 ? (
                <EmptyState>{emptyMessage}</EmptyState>
              ) : (
                filteredOptions.map((option) => (
                  <StyledCommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                  >
                    <ItemCheck $visible={option === value}>
                      <Check size={14} />
                    </ItemCheck>
                    {option}
                  </StyledCommandItem>
                ))
              )}
            </StyledCommandList>
          </StyledCommand>
        </StyledPopoverContent>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
