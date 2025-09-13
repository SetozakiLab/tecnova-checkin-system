import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Search, Eye, EyeOff, AlertCircle } from "lucide-react";

interface FormInputProps extends React.ComponentProps<typeof Input> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showRequiredIndicator?: boolean;
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    required, 
    showRequiredIndicator = true,
    className, 
    id,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperTextId = `${inputId}-helper`;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId} className="text-sm font-medium">
            {label}
            {required && showRequiredIndicator && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
        )}
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive/20",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperTextId : undefined}
          required={required}
          {...props}
        />
        {error && (
          <div id={errorId} className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {helperText && !error && (
          <p id={helperTextId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

interface SearchInputProps extends Omit<FormInputProps, "type"> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    onSearch, 
    onClear, 
    placeholder = "検索...", 
    className,
    onChange,
    ...props 
  }, ref) => {
    const [value, setValue] = React.useState(props.value || "");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      if (onChange) onChange(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch(value as string);
      }
    };

    const handleClear = () => {
      setValue("");
      if (onClear) onClear();
    };

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <FormInput
          ref={ref}
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn("pl-9", className)}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

interface PasswordInputProps extends Omit<FormInputProps, "type"> {
  showToggle?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showToggle = true, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className="relative">
        <FormInput
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn(showToggle && "pr-10", className)}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-8 h-4 w-4 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";