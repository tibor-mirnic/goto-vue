import type {
  ButtonHTMLAttributes,
  DefineComponent,
  DefineSetupFnComponent,
  HTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes
} from 'vue';
import Button from './buttons/UiButton.vue';
import Label from './labels/UiLabel.vue';
import Ul from './lists/UiUl.vue';
import Select from './selects/UiSelect.vue';

// Single-root components forward DOM attributes and listeners to their native elements.
export const UiButton = Button as DefineComponent<ButtonHTMLAttributes>;
export const UiLabel = Label as DefineComponent<LabelHTMLAttributes>;
export const UiSelect = Select as DefineSetupFnComponent<
  Omit<SelectHTMLAttributes, 'multiple' | 'value'> & { modelValue: string; multiple?: false; value?: never },
  { 'update:modelValue': (value: string) => void }
>;
export const UiUl = Ul as DefineComponent<HTMLAttributes>;
