"use client";
import { useState, useId, useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  GRADE_DEFINITIONS,
  GradeValue,
  formatGradeDisplay,
} from "@/domain/value-objects/grade";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

export interface GradeSelectProps {
  value: GradeValue | null | undefined;
  onChange: (value: GradeValue | null) => void;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  id?: string;
  className?: string;
}

const OPTIONS = GRADE_DEFINITIONS;

export function GradeSelect({
  value,
  onChange,
  disabled,
  placeholder = "学年を選択",
  id,
  className,
}: GradeSelectProps) {
  const compId = id || useId();
  const [open, setOpen] = useState(false);
  const displayLabel = useMemo(() => {
    if (!value) return placeholder;
    const f = OPTIONS.find((o) => o.value === value);
    return f ? f.label : value;
  }, [value, placeholder]);

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            id={compId}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <span className="truncate text-left max-w-[200px]">
              {displayLabel}
            </span>
            <svg
              className="w-4 h-4 opacity-60"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
              />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[240px]" align="start">
          <Command>
            <CommandInput placeholder="学年検索..." />
            <CommandList>
              <CommandEmpty>該当なし</CommandEmpty>
              <CommandGroup heading="学年">
                {OPTIONS.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
              {value && (
                <CommandGroup heading="クリア">
                  <CommandItem
                    value="クリア"
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                  >
                    未設定に戻す
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function formatGrade(value: string | null | undefined): string {
  return formatGradeDisplay(value);
}
