/**
 * *****************************************************************************
 * 
 * Cache
 *
 * *****************************************************************************
 */

export const memCache = (max) => new Proxy({
  max: max,
  size: 0,
  cache: new Map(),
  _cache: new Map(),
}, {
	get: function (target, property, receiver) {
    if (property === 'keys') return () => keys.call(target);
    if (property === 'set') return args => set.call(target, args);
    if (property === 'get') return args => get.call(target, args);
		return Reflect.get(target, property, receiver);
  },
	set: function (target, property, value) {
  },
});

function keys () {
  const cacheKeys = new Set();
  const now = Date.now();

  for (const entry of this.cache.entries()) checkEntry(entry);
  for (const entry of this._cache.entries()) checkEntry(entry);

  function checkEntry(entry) {
    const key = entry[0];
    const item = entry[1];
    if (entry[1].value && (!entry[1].expired) || item.expired >= now) {
      cacheKeys.add(key);
    }
  }

  return Array.from(cacheKeys.keys());
}

function set (key, value, options) {
  const maxAge = options && options.maxAge;
  const expired = maxAge ? Date.now() + maxAge : 0;

  let item = this.cache.get(key);
  if (item) {
    item.expired = expired;
    item.value = value;
  } else {
    item = { value, expired, };
    _update.call(this, key, item);
  }
}

function _update (key, item) {
  this.cache.set(key, item);
  this.size++;
  if (this.size >= this.max) {
    this.size = 0;
    this._cache = this.cache;
    this.cache = new Map();
  }
}

function get(key, options) {

  const maxAge = options && options.maxAge;

  // only call Date.now() when necessary
  let now;
  const getNow = () => now = now ? now : Date.now();

  let item = this.cache.get(key); // read from cache

  if (item) {
    // check expired
    if (item.expired && getNow() > item.expired) {
      item.expired = 0;
      item.value = undefined;
    } else {
      // update expired in get
      if (maxAge !== undefined) {
        item.expired = maxAge ? getNow() + maxAge : 0;
      }
    }

    return item.value;
  }

  // try to read from _cache
  item = this._cache.get(key);

  if (item) {
    // check expired
    if (item.expired && getNow() > item.expired) {
      item.expired = 0;
      item.value = undefined;
    } else {
      _update.call(this, key, item); // not expired, save to cache
      // update expired in get
      if (maxAge !== undefined) {
        item.expired = maxAge ? getNow() + maxAge : 0;
      }
    }

    return item.value;
  }
}
