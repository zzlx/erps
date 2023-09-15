/**
 * *****************************************************************************
 * 
 *
 * 结合异步迭代器以一种简单的方式实现一个类似于 pipe 一样的方法完成数据源到目标源的数据复制。
 * 
 *
 * *****************************************************************************
 */ 

export function bigCopy(src, dest) {
  return new Promise(async (resolve, reject) => {
    dest.on('error', reject);

    try {
      for await (const chunk of src) {
        await _write(dest, chunk);
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function write(dest, chunk) {
  return new Promise(resolve => {
    if (dest.write(chunk)) {
      return resolve(null);
    }

    dest.once('drain', resolve);
  })  
}
