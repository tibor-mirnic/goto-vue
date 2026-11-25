import type { DefineSetupFnComponent, SelectHTMLAttributes } from 'vue';
import Select from './UiSelect.vue';

export const UiSelect = Select as DefineSetupFnComponent<
  Omit<SelectHTMLAttributes, 'multiple' | 'value'> & { modelValue: string; multiple?: false; value?: never },
  { 'update:modelValue': (value: string) => void }
>;
