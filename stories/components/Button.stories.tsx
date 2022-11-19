import type { ButtonProps } from '@/components';
import type { Meta, StoryObj, StoryFn } from '@storybook/react';

import { Button } from '@/components';

export default {
  title: 'Example/Button',
  component: Button,
  tags: ['docsPage'],
  argTypes: {
    theme: {
      control: 'default',
    },
  },
};

const Template: StoryFn<typeof Button> = ({
  children,
  ...args
}: ButtonProps) => <Button {...args}>{children}</Button>;

export const Default = Template.bind({});
Default.args = {
  theme: 'default',
  children: 'キャンセル',
};

export const Primary = Template.bind({});
Primary.args = {
  theme: 'primary',
  children: '許可',
};

export const Warn = Template.bind({});
Warn.args = {
  theme: 'warn',
  children: '却下',
};

// export const Large: Story = {
//   args: {
//     size: 'large',
//     label: 'Button',
//   },
// };

// export const Small: Story = {
//   args: {
//     size: 'small',
//     label: 'Button',
//   },
// };
