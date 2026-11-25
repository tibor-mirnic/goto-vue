// Native TypeScript treats SFC imports as components. vue-tsc checks their concrete props, events and templates.
declare module '*.vue' {
  const component: import('vue').Component;
  export default component;
}
