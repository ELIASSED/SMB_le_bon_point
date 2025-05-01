import { useState, ChangeEvent, FormEvent } from 'react';

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>> & { submit?: string };
  isSubmitting: boolean;
}

export function useForm<T>(
  initialValues: T,
  validate: (values: T) => Partial<Record<keyof T, string>>,
  onSubmit: (values: T) => Promise<void>
) {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    isSubmitting: false,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      },
      errors: { ...prev.errors, [name]: '' },
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [name]: file },
      errors: { ...prev.errors, [name]: '' },
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = validate(state.values);
    setState((prev) => ({ ...prev, errors }));

    if (Object.keys(errors).length === 0) {
      setState((prev) => ({ ...prev, isSubmitting: true }));
      try {
        await onSubmit(state.values);
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          errors: { ...prev.errors, submit: error.message || 'Une erreur est survenue.' },
        }));
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    }
  };

  return {
    values: state.values,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    handleChange,
    handleFileChange,
    handleSubmit,
    setValues: (values: T) => setState((prev) => ({ ...prev, values })),
    setErrors: (errors: Partial<Record<keyof T, string>>) =>
      setState((prev) => ({ ...prev, errors: { ...prev.errors, ...errors } })),
  };
}