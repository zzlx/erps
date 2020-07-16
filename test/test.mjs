



class Test {
  constructor(opts = {}) {
    this.opts = Object.assign({}, opts);
    this.opts.ttt = 'ttt';
    console.log(opts);
    console.log(this.opts);
  }
}

const t = new Test({ac: 'ac'});
