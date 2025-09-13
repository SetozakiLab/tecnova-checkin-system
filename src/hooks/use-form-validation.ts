import { useState, useCallback } from "react";
import * as React from "react";
import { z } from "zod";

type ValidationRule<T> = (value: T) => string | null;
type ValidationRules<T> = Record<keyof T, ValidationRule<T[keyof T]>[]>;

interface UseFormValidationState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
}

interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  zodSchema?: z.ZodSchema<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T) => Promise<void> | void;
}

interface UseFormValidationReturn<T> extends UseFormValidationState<T> {
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  setFieldTouched: (field: keyof T) => void;
  validateField: (field: keyof T) => string | null;
  validateForm: () => boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: (newValues?: T) => void;
  getFieldProps: (field: keyof T) => {
    value: T[keyof T];
    onChange: (value: T[keyof T]) => void;
    onBlur: () => void;
    error: string | undefined;
    touched: boolean;
  };
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationRules,
  zodSchema,
  validateOnChange = true,
  validateOnBlur = true,
  onSubmit,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [state, setState] = useState<UseFormValidationState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: true,
    isSubmitting: false,
  });

  const validateField = useCallback((field: keyof T): string | null => {
    const value = state.values[field];

    // Zod validation takes priority
    if (zodSchema) {
      try {
        zodSchema.shape[field as string].parse(value);
      } catch (err) {
        if (err instanceof z.ZodError) {
          return err.errors[0]?.message || "バリデーションエラー";
        }
      }
    }

    // Custom validation rules
    if (validationRules?.[field]) {
      for (const rule of validationRules[field]) {
        const error = rule(value);
        if (error) {
          return error;
        }
      }
    }

    return null;
  }, [state.values, validationRules, zodSchema]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasErrors = false;

    // Validate all fields
    for (const field in state.values) {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    }

    setState((prev) => ({
      ...prev,
      errors: newErrors,
      isValid: !hasErrors,
    }));

    return !hasErrors;
  }, [state.values, validateField]);

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [field]: value },
    }));

    if (validateOnChange) {
      const error = validateField(field);
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [field]: error || undefined },
      }));
    }
  }, [validateOnChange, validateField]);

  const setValues = useCallback((values: Partial<T>) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, ...values },
    }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setState((prev) => {
      const newErrors = { ...prev.errors };
      delete newErrors[field];
      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: {},
      isValid: true,
    }));
  }, []);

  const setTouched = useCallback((field: keyof T, touched = true) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(field, true);
    
    if (validateOnBlur) {
      const error = validateField(field);
      setState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [field]: error || undefined },
      }));
    }
  }, [validateOnBlur, validateField, setTouched]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    setState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const isValid = validateForm();
      if (!isValid) {
        return;
      }

      if (onSubmit) {
        await onSubmit(state.values);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [validateForm, onSubmit, state.values]);

  const reset = useCallback((newValues?: T) => {
    setState({
      values: newValues || initialValues,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false,
    });
  }, [initialValues]);

  const getFieldProps = useCallback((field: keyof T) => ({
    value: state.values[field],
    onChange: (value: T[keyof T]) => setValue(field, value),
    onBlur: () => setFieldTouched(field),
    error: state.errors[field],
    touched: !!state.touched[field],
  }), [state.values, state.errors, state.touched, setValue, setFieldTouched]);

  return {
    ...state,
    setValue,
    setValues,
    setError,
    clearError,
    clearErrors,
    setTouched,
    setFieldTouched,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    getFieldProps,
  };
}