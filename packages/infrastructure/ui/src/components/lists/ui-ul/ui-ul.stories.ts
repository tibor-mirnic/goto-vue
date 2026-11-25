import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { UiUl } from './index.ts';

const meta = {
  title: 'Components/Lists/UiUl',
  component: UiUl,
  args: { name: 'Available sizes', items: ['Small', 'Medium', 'Large'] },
  argTypes: {
    name: { control: 'text', description: 'Accessible name of the list.' },
    items: { control: 'object', description: 'String values rendered as list items in the default slot.' }
  },
  parameters: {
    docs: {
      description: {
        component:
          'Place native li elements in the default slot. Use aria-label to name the list directly or aria-labelledby to reference a visible heading.'
      }
    }
  },
  render: (args) => ({
    components: { UiUl },
    setup: () => ({ args }),
    template: `<UiUl :aria-label="args.name">
      <li v-for="(item, index) in args.items" :key="index">{{ item }}</li>
    </UiUl>`
  })
} satisfies Meta<{ name: string; items: string[] }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SlottedItems: Story = {
  parameters: {
    docs: {
      source: {
        language: 'vue',
        code: `<UiUl aria-label="Available sizes">
  <li>Small</li>
  <li>Medium</li>
  <li>Large</li>
</UiUl>`
      }
    }
  }
};

export const NamedByHeading: Story = {
  render: (args, context) => ({
    components: { UiUl },
    setup: () => ({ args, headingId: context.id + '-heading' }),
    template: `<h3 :id="headingId">{{ args.name }}</h3>
      <UiUl :aria-labelledby="headingId">
        <li v-for="(item, index) in args.items" :key="index">{{ item }}</li>
      </UiUl>`
  }),
  parameters: {
    docs: {
      source: {
        language: 'vue',
        code: `<h3 id="sizes">Available sizes</h3>
<UiUl aria-labelledby="sizes">
  <li v-for="size in ['Small', 'Medium', 'Large']" :key="size">{{ size }}</li>
</UiUl>`
      }
    }
  }
};

export const Empty: Story = {
  args: { items: [] },
  parameters: {
    docs: {
      description: {
        story: 'An empty slot renders a list with no visible items. Add a string to items in Controls to populate it.'
      },
      source: { language: 'vue', code: '<UiUl aria-label="Available sizes" />' }
    }
  }
};
