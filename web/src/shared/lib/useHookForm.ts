import { zodResolver } from '@hookform/resolvers/zod';
import {
  Control,
  DefaultValues,
  FieldValues,
  useForm,
  UseFormGetValues,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { ZodType } from 'zod';

export const useHookForm = <TValues extends FieldValues>(
  defaultValues: TValues,
  resolver: ZodType<TValues> | null = null,
  mode: 'onBlur' | 'onChange' | 'onSubmit' | 'onTouched' | 'all' | undefined = 'onChange',
): {
  register: UseFormRegister<TValues>;
  handleSubmit: UseFormHandleSubmit<TValues>;
  getValues: UseFormGetValues<TValues>;
  reset: UseFormReset<TValues>;
  control: Control<TValues>;
  setValue: UseFormSetValue<TValues>;
  watch: UseFormWatch<TValues>;
} => {
  const form = useForm({
    defaultValues: defaultValues as DefaultValues<TValues>,
    mode,
    resolver: resolver ? zodResolver(resolver) : undefined,
  });

  return {
    register: form.register,
    handleSubmit: form.handleSubmit,
    getValues: form.getValues,
    reset: form.reset,
    control: form.control,
    setValue: form.setValue,
    watch: form.watch,
  };
};
