import type { Ref } from 'vue';

export const useSelect = (model: Ref<string>) => {
  const onChange = (event: Event) => {
    model.value = (event.currentTarget as HTMLSelectElement).value;
  };

  return { onChange };
};
