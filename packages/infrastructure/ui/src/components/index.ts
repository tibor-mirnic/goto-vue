import type { ButtonHTMLAttributes, DefineComponent, LabelHTMLAttributes } from 'vue';
import Button from './buttons/UiButton.vue';
import Label from './labels/UiLabel.vue';

// Both single-root components forward DOM attributes and listeners to their native elements.
export const UiButton = Button as DefineComponent<ButtonHTMLAttributes>;
export const UiLabel = Label as DefineComponent<LabelHTMLAttributes>;
