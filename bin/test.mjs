const pk = await import('../package.json', { assert: { type: 'json' } });
console.log(pk);
