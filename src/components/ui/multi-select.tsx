import * as React from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  /** Allow adding values that are not in the options list */
  allowCustom?: boolean;
};

const MultiSelect = ({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
  searchable = false,
  allowCustom = false,
}: Props) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  };

  const addCustom = () => {
    const v = query.trim();
    if (!v) return;
    if (!selected.includes(v)) onChange([...selected, v]);
    setQuery("");
  };

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const exactMatch = options.some(
    (o) => o.toLowerCase() === query.trim().toLowerCase()
  );

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-secondary px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring",
            className
          )}
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {selected.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="bg-primary/15 text-primary hover:bg-primary/25 gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(v);
                  }}
                >
                  {v}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </span>
          )}
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-1"
        align="start"
      >
        {(searchable || allowCustom) && (
          <span className="flex gap-1 p-1">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && allowCustom) {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder={allowCustom ? "Search or type a new name" : "Search..."}
              className="h-8 bg-secondary"
            />
          </span>
        )}
        <ul className="list-none p-0 m-0 max-h-56 overflow-y-auto">
          {allowCustom && query.trim() && !exactMatch && (
            <li>
              <button
                type="button"
                onClick={addCustom}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-primary hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                Add &quot;{query.trim()}&quot;
              </button>
            </li>
          )}
          {filtered.length === 0 && !query.trim() && (
            <li className="px-2 py-1.5 text-sm text-muted-foreground">
              No options
            </li>
          )}
          {filtered.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => toggle(option)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                    isSelected && "font-medium"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </span>
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export { MultiSelect };
