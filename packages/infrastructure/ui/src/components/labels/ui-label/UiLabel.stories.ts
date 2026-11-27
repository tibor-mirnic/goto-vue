import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { UiLabel } from './index.ts';

const meta = {
  title: 'Components/Labels/UiLabel',
  component: UiLabel,
  args: { text: 'Display name' },
  argTypes: { text: { control: 'text', description: 'Text in the default slot.' } },
  parameters: { docs: { description: { component: 'Click the label to focus its associated control.' } } }
} satisfies Meta<{ text: string }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ExplicitAssociation: Story = {
  render: (args, context) => ({
    components: { UiLabel },
    setup: () => ({ args, inputId: context.id + '-input' }),
    template: '<UiLabel :for="inputId">{{ args.text }}</UiLabel> <input :id="inputId" />'
  }),
  parameters: {
    docs: {
      source: {
        language: 'vue',
        code: '<UiLabel for="display-name">Display name</UiLabel>\n<input id="display-name" />'
      }
    }
  }
};

export const NestedControl: Story = {
  render: (args) => ({
    components: { UiLabel },
    setup: () => ({ args }),
    template: '<UiLabel>{{ args.text }} <input /></UiLabel>'
  }),
  parameters: {
    docs: { source: { language: 'vue', code: '<UiLabel>Display name <input /></UiLabel>' } }
  }
};
