export const enablePaletteMocks = async () => {
  const [{ createPaletteHandlers }, { network }] = await Promise.all([
    import('@goto/domain-palette/moq'),
    import('virtual:msw')
  ]);

  network.configure({ handlers: createPaletteHandlers(window.location.origin), onUnhandledFrame: 'bypass' });
  await network.enable();
};
