"use client";

import { format, isAfter, isBefore } from "date-fns";
import { ja } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export interface DatePickerProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Button>,
    "onChange" | "value"
  > {
  value?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  clearable?: boolean;
  formatString?: string;
  popoverClassName?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      placeholder = "日付を選択",
      disabled,
      min,
      max,
      clearable = true,
      formatString = "yyyy-MM-dd",
      className,
      popoverClassName,
      align = "start",
      sideOffset,
      ...buttonProps
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const selectedDate = React.useMemo(() => parseDate(value), [value]);
    const minDate = React.useMemo(() => parseDate(min), [min]);
    const maxDate = React.useMemo(() => parseDate(max), [max]);

    const displayText = selectedDate
      ? format(selectedDate, formatString, { locale: ja })
      : placeholder;

    const isDisabled = React.useCallback(
      (date: Date) => {
        if (minDate && isBefore(date, minDate)) return true;
        if (maxDate && isAfter(date, maxDate)) return true;
        return false;
      },
      [minDate, maxDate],
    );

    const handleSelect = (date: Date | undefined) => {
      if (date) {
        onChange?.(format(date, "yyyy-MM-dd"));
      } else {
        onChange?.(undefined);
      }
      setOpen(false);
    };

    const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      onChange?.(undefined);
      setOpen(false);
    };

    return (
      <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
        <div className="relative">
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground",
                className,
              )}
              {...buttonProps}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {displayText}
            </Button>
          </PopoverTrigger>
          {clearable && selectedDate && !disabled ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
              aria-label="日付をクリア"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
        <PopoverContent
          className={cn("w-auto p-0", popoverClassName)}
          align={align}
          sideOffset={sideOffset}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            initialFocus
            locale={ja}
            disabled={isDisabled}
          />
        </PopoverContent>
      </Popover>
    );
  },
);

DatePicker.displayName = "DatePicker";
