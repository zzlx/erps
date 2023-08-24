/**
 * *****************************************************************************
 *
 * 目录配置管理器
 *
 * 
 * 
 * *****************************************************************************
 */

import fs from "node:fs";
import path from "node:path";
import util from "node:util";

const debug = util.debuglog("debug:paths");
const dirname = path.dirname;
const __filename = import.meta.url.substr(7);
const __dirname = dirname(__filename);
const __root = dirname(dirname(__dirname));

export const paths = new Proxy(getPaths(__root), {
  get: function (target, property, receiver) {
    if (property === "ROOT") return __root;
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value, receiver) {
    if (!fs.existsSync(value)) fs.mkdirSync(value, { recursive: true }); 
    target[property] = value;
    // return Reflect.set(...arguments);
    return true;
  },
});

// create public directory if not exist
if (paths.PUBLIC_HTML == null) {
  paths.PUBLIC_HTML = path.join(__root, "public_html"); 

  fs.promises.mkdir(path.join(__root, "public_html", "assets"), { 
    recursive: true,
  }).catch(console.error); 
}

/*
 
// make sure pulic-html path is exists
if (paths.PUBLIC_HTML == null) {
  paths.PUBLIC_HTML = path.join(os.homedir(), "public_html"); 
  fs.promises.mkdir(paths.PUBLIC_HTML, {
    recursive: true 
  }).catch((err) => {
    console.log(err);
  }); 
}
*/

/**
 * Get paths from a path
 */

function getPaths (root) {
  const paths = Object.create(null);

  fs.readdirSync(root, { withFileTypes: true }).forEach(p => {

    const name = String(p.name)
      .replace(/^(\.)/, "DOT_")
      .replace(/(\..+)$/, "")
      .replace(/[\\.|-]/g, "_")
      .toUpperCase(); 

    Object.defineProperty(paths, name, { 
      value: path.join(root, p.name),
      writable: false,
      enumerable: false,
      configurable: false,
    });
  });

  return paths;
}
