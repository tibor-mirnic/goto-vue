import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { UiButton } from './index.ts';

const meta = {
  title: 'Components/Buttons/UiButton',
  component: UiButton,
  args: { text: 'Count clicks', disabled: false },
  argTypes: {
    text: { control: 'text', description: 'Button text in the default slot.' },
    disabled: { control: 'boolean', description: 'Disables the native button.' }
  },
  parameters: {
    docs: { description: { component: 'UiButton defaults to type="button". Set its type to submit or reset a form.' } }
  },
  render: (args) => ({
    components: { UiButton },
    setup: () => ({ args, count: ref(0) }),
    template: `<UiButton :disabled="args.disabled" @click="count++">{{ args.text }}</UiButton>
      <p>Clicks: <output>{{ count }}</output></p>`
  })
} satisfies Meta<{ text: string; disabled: boolean }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Click: Story = {
  parameters: {
    docs: {
      source: {
        language: 'vue',
        code: `<script setup lang="ts">
import { ref } from 'vue';
import { UiButton } from '@goto/infrastructure-ui';

const count = ref(0);
</script>

<template>
  <UiButton @click="count++">Count clicks</UiButton>
  <p>Clicks: <output>{{ count }}</output></p>
</template>`
      }
    }
  }
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    docs: { source: { language: 'vue', code: '<UiButton disabled>Count clicks</UiButton>' } }
  }
};

export const SubmitForm: Story = {
  args: { text: 'Apply' },
  render: (args) => ({
    components: { UiButton },
    setup: () => ({ args, name: ref('Fern'), submitted: ref('') }),
    template: `<form @submit.prevent="submitted = name">
      <label>Name <input v-model="name" required /></label>
      <UiButton type="submit" :disabled="args.disabled">{{ args.text }}</UiButton>
      <p>Submitted name: <output>{{ submitted }}</output></p>
    </form>`
  }),
  parameters: {
    docs: {
      source: {
        language: 'vue',
        code: `<form @submit.prevent="submitted = name">
  <label>Name <input v-model="name" required /></label>
  <UiButton type="submit">Apply</UiButton>
</form>`
      }
    }
  }
};

export const ResetForm: Story = {
  args: { text: 'Restore name' },
  render: (args) => ({
    components: { UiButton },
    setup: () => ({ args }),
    template: `<form @submit.prevent>
      <label>Name <input value="Fern" /></label>
      <UiButton type="reset" :disabled="args.disabled">{{ args.text }}</UiButton>
    </form>`
  }),
  parameters: {
    docs: {
      description: { story: 'Edit the name, then restore its initial value with the reset button.' },
      source: {
        language: 'vue',
        code: `<form @submit.prevent>
  <label>Name <input value="Fern" /></label>
  <UiButton type="reset">Restore name</UiButton>
</form>`
      }
    }
  }
};
