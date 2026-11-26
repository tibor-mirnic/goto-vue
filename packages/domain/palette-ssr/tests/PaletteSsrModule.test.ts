import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { createRenderer, h, nextTick, shallowRef } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { PaletteSsrModule } from '@goto/domain-palette-ssr';

type PaletteViewerProps = Pick<
  InstanceType<typeof PaletteSsrModule>['$props'],
  'selectedPalette' | 'status' | 'result'
>;

const aurora = {
  selectedPalette: 'aurora',
  status: 'ready',
  result: { palette: 'aurora', colors: ['indigo', 'harbor blue'] }
} satisfies PaletteViewerProps;
const mist = {
  selectedPalette: 'mist',
  status: 'ready',
  result: { palette: 'mist', colors: [] }
} satisfies PaletteViewerProps;

type Node = {
  tag: string;
  text: string;
  props: Record<string, unknown>;
  parent: Node | null;
  children: Node[];
};

const createNode = (tag: string, text = ''): Node => ({ tag, text, props: {}, parent: null, children: [] });

const remove = (node: Node) => {
  if (!node.parent) return;
  const { children } = node.parent;
  children.splice(children.indexOf(node), 1);
  node.parent = null;
};

const renderer = createRenderer<Node, Node>({
  createElement: (tag) => createNode(tag),
  createText: (text) => createNode('#text', text),
  createComment: () => createNode('#comment'),
  setText: (node, text) => {
    node.text = text;
  },
  setElementText: (node, text) => {
    for (const child of node.children) child.parent = null;
    node.children.length = 0;
    node.text = text;
  },
  patchProp: (node, key, _previous, value) => {
    node.props[key] = value;
  },
  parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
  insert: (node, parent, anchor) => {
    remove(node);
    const index = anchor ? parent.children.indexOf(anchor) : parent.children.length;
    parent.children.splice(index, 0, node);
    node.parent = parent;
  },
  remove
});

const elements = (node: Node, tag: string): Node[] => [
  ...(node.tag === tag ? [node] : []),
  ...node.children.flatMap((child) => elements(child, tag))
];
const textContent = (node: Node): string => node.text + node.children.map(textContent).join('');

const mountModule = (initialProps: PaletteViewerProps) => {
  const props = shallowRef(initialProps);
  const onSelect = vi.fn();
  const onRetry = vi.fn();
  const root = createNode('root');
  const app = renderer.createApp({ render: () => h(PaletteSsrModule, { ...props.value, onSelect, onRetry }) });
  app.mount(root);
  onTestFinished(() => app.unmount());

  const update = async (nextProps: PaletteViewerProps) => {
    props.value = nextProps;
    await nextTick();
  };

  return { root, update, onSelect, onRetry };
};

test('SSR renders the supplied selection and ordered list without a request', async () => {
  const request = vi.fn<typeof fetch>();
  vi.stubGlobal('fetch', request);
  onTestFinished(() => {
    vi.unstubAllGlobals();
  });

  const html = await renderToString(h(PaletteSsrModule, aurora));

  expect(html).toContain('<option value="aurora" selected>aurora</option>');
  expect(html.match(/<li[^>]*>[^<]+<\/li>/g)).toEqual(['<li>indigo</li>', '<li>harbor blue</li>']);
  expect(request).not.toHaveBeenCalled();
});

test('SSR renders a distinct label association for each mounted module', async () => {
  const html = await renderToString(h('div', [h(PaletteSsrModule, aurora), h(PaletteSsrModule, mist)]));
  const targets = Array.from(html.matchAll(/<label[^>]+\bfor="([^"]+)"/g), ([, target]) => target);
  const ids = Array.from(html.matchAll(/<select[^>]+\bid="([^"]+)"/g), ([, id]) => id);

  expect(targets).toEqual(ids);
  expect(new Set(ids).size).toBe(2);
});

test('updates from host props and suppresses older results while the selection changes', async () => {
  const { root, update } = mountModule(aurora);
  const list = () => elements(root, 'li').map(textContent);
  const status = () => textContent(elements(root, 'div').find((node) => node.props.role === 'status')!);

  expect(list()).toEqual(['indigo', 'harbor blue']);

  await update({ ...aurora, status: 'pending' });
  expect(status()).toBe('Loading aurora…');
  expect(list()).toEqual([]);

  await update({ ...mist, result: aurora.result });
  expect(status()).toBe('Loading mist…');
  expect(elements(root, 'select')[0].props.value).toBe('mist');
  expect(list()).toEqual([]);

  await update(mist);
  expect(status()).toBe('No colors in mist');
  expect(list()).toEqual([]);

  await update({ ...mist, status: 'error' });
  expect(status()).toBe('Could not load mist.');
  expect(elements(root, 'button').map(textContent)).toEqual(['Retry']);

  await update(aurora);
  expect(list()).toEqual(['indigo', 'harbor blue']);
  expect(elements(root, 'button')).toEqual([]);
});

test('forwards one valid selection and one retry to the host', () => {
  const { root, onSelect, onRetry } = mountModule({ ...aurora, status: 'error' });
  const [select] = elements(root, 'select');
  const change = select.props.onChange as (event: { currentTarget: { value: string } }) => void;

  change({ currentTarget: { value: 'mist' } });
  change({ currentTarget: { value: 'unsupported' } });
  change({ currentTarget: { value: 'aurora' } });

  expect(onSelect.mock.calls).toEqual([['mist']]);
  expect(select.props.value).toBe('aurora');

  const click = elements(root, 'button')[0].props.onClick as () => void;
  click();
  expect(onRetry.mock.calls).toEqual([[]]);
});
