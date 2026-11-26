import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { createRenderer, h, nextTick, shallowRef } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { type PaletteName, type PaletteViewerState, PePaletteSsrPage } from '@goto/domain-palette-ssr';

const aurora = { status: 'ready', palette: 'aurora', colors: ['indigo', 'harbor blue'] } satisfies PaletteViewerState;
const mist = { status: 'ready', palette: 'mist', colors: [] } satisfies PaletteViewerState;

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

const mountPage = (getProps: () => InstanceType<typeof PePaletteSsrPage>['$props']) => {
  const root = createNode('root');
  const app = renderer.createApp({ render: () => h(PePaletteSsrPage, getProps()) });
  app.mount(root);
  onTestFinished(() => app.unmount());
  return root;
};

test('SSR renders the supplied selection and colors in order', async () => {
  const html = await renderToString(h(PePaletteSsrPage, { state: aurora }));

  expect(html).toContain('<option value="aurora" selected>aurora</option>');
  expect(html.match(/<li[^>]*>[^<]+<\/li>/g)).toEqual(['<li>indigo</li>', '<li>harbor blue</li>']);
});

test('SSR renders a distinct label association for each mounted page', async () => {
  const page = () => h(PePaletteSsrPage, { state: aurora });
  const html = await renderToString(h('div', [page(), page()]));
  const targets = Array.from(html.matchAll(/<label[^>]+\bfor="([^"]+)"/g), ([, target]) => target);
  const ids = Array.from(html.matchAll(/<select[^>]+\bid="([^"]+)"/g), ([, id]) => id);

  expect(targets).toEqual(ids);
  expect(new Set(ids).size).toBe(2);
});

test('mounts synchronously and renders each host state as the prop changes', async () => {
  const state = shallowRef<PaletteViewerState>(aurora);
  const root = mountPage(() => ({ state: state.value }));
  const list = () => elements(root, 'li').map(textContent);
  const status = () => textContent(elements(root, 'div').find((node) => node.props.role === 'status')!);

  expect(status()).toBe('Colors in aurora');
  expect(list()).toEqual(['indigo', 'harbor blue']);

  state.value = { status: 'pending', palette: 'mist' };
  await nextTick();
  expect(status()).toBe('Loading mist…');
  expect(elements(root, 'select')[0].props.value).toBe('mist');
  expect(list()).toEqual([]);

  state.value = { status: 'error', palette: 'mist' };
  await nextTick();
  expect(status()).toBe('Could not load mist.');
  expect(elements(root, 'button').map(textContent)).toEqual(['Retry']);

  state.value = mist;
  await nextTick();
  expect(status()).toBe('No colors in mist');
  expect(list()).toEqual([]);
  expect(elements(root, 'button')).toEqual([]);
});

test('forwards selection and retry intents while the host controls state', async () => {
  const state = shallowRef<PaletteViewerState>({ status: 'error', palette: 'aurora' });
  const onSelect = vi.fn<(palette: PaletteName) => void>();
  const onRetry = vi.fn<() => void>();
  const root = mountPage(() => ({ state: state.value, onSelect, onRetry }));
  const [select] = elements(root, 'select');
  const change = select.props.onChange as (event: { currentTarget: { value: string } }) => void;

  change({ currentTarget: { value: 'aurora' } });
  change({ currentTarget: { value: 'unsupported' } });
  expect(onSelect).not.toHaveBeenCalled();

  change({ currentTarget: { value: 'mist' } });
  expect(onSelect.mock.calls).toEqual([['mist']]);
  expect(select.props.value).toBe('aurora');

  state.value = { status: 'error', palette: 'mist' };
  await nextTick();
  expect(select.props.value).toBe('mist');

  const click = elements(root, 'button')[0].props.onClick as () => void;
  click();
  expect(onRetry.mock.calls).toEqual([[]]);
  expect(elements(root, 'button').map(textContent)).toEqual(['Retry']);
});
