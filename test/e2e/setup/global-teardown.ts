module.exports = async () => {
  const ctx = (global as any).__TESTCONTAINERS__;
  if (ctx?.pg) await ctx.pg.stop();
};
