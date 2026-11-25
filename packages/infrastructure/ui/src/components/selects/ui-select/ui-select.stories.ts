import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { useArgs } from 'storybook/preview-api';
import { type ComponentOptions, computed, ref } from 'vue';
import { UiButton, UiLabel } from '../../index.ts';
import UiSelect from './UiSelect.vue';

type SelectArgs = { modelValue: string; disabled: boolean };

const options = `<option disabled value="">Choose a size</option>
    <option value="small">Small</option>
    <option value="large">Large</option>`;

const example = (initialValue: string, disabled = false, parentControl = false) => `<script setup lang="ts">
import { ref } from 'vue';
import { ${parentControl ? 'UiButton, ' : ''}UiLabel, UiSelect } from '@goto/infrastructure-ui';

const size = ref('${initialValue}');
</script>

<template>
  <UiLabel for="size">Size</UiLabel>
  <UiSelect id="size" v-model="size"${disabled ? ' disabled' : ''}>
    ${options}
  </UiSelect>${parentControl ? '\n  <UiButton @click="size = \'large\'">Choose large</UiButton>' : ''}
</template>`;

const meta = {
  title: 'Components/Selects/UiSelect',
  component: UiSelect as ComponentOptions<SelectArgs>,
  args: { modelValue: '', disabled: false },
  argTypes: {
    modelValue: {
      options: ['', 'small', 'large'],
      control: { type: 'select', labels: { '': 'Choose a size', small: 'Small', large: 'Large' } },
      description: 'String value bound through v-model.'
    },
    disabled: { control: 'boolean', description: 'Disables the native select.' }
  },
  parameters: {
    docs: {
      description: {
        component:
          'Supply native options through the default slot. The selected option updates the string bound through v-model. Associate a label using its for attribute and the select’s id.'
      }
    }
  },
  render: (args, context) => {
    const [, updateArgs] = useArgs<SelectArgs>();
    return {
      components: { UiButton, UiLabel, UiSelect },
      setup: () => {
        const size = computed({
          get: () => args.modelValue,
          set: (modelValue: string) => updateArgs({ modelValue })
        });
        const lastChange = ref('');
        const onChange = (event: Event) => {
          lastChange.value = (event.currentTarget as HTMLSelectElement).value;
        };
        return {
          args,
          size,
          lastChange,
          onChange,
          id: context.id + '-size',
          parentControl: context.parameters.parentControl
        };
      },
      template: `<UiLabel :for="id">Size</UiLabel>
        <UiSelect :id="id" v-model="size" :disabled="args.disabled" @change="onChange">
          ${options}
        </UiSelect>
        <UiButton v-if="parentControl" @click="size = 'large'">Choose large</UiButton>
        <p>Model value: <output>{{ size || '(empty)' }}</output></p>
        <p v-if="lastChange">Last native change: <output>{{ lastChange }}</output></p>`
    };
  }
} satisfies Meta<SelectArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {
  parameters: { docs: { source: { language: 'vue', code: example('') } } }
};

export const Preselected: Story = {
  args: { modelValue: 'small' },
  parameters: { docs: { source: { language: 'vue', code: example('small') } } }
};

export const Disabled: Story = {
  args: { modelValue: 'large', disabled: true },
  parameters: { docs: { source: { language: 'vue', code: example('large', true) } } }
};

export const ParentModel: Story = {
  args: { modelValue: 'small' },
  parameters: {
    parentControl: true,
    docs: {
      description: {
        story:
          'Choose large with the button to update the select from its parent. Picking an option directly also fires the native change event.'
      },
      source: { language: 'vue', code: example('small', false, true) }
    }
  }
};
