// 代理自动配置

// 需要使用代理服务器访问的域名
const domains = {
  "google.com": 1, 
  "google.hk": 1
};

const direct = 'DIRECT;';
const proxy = "PROXY 54.241.97.197:80;";
const hasOwnProperty = Object.hasOwnProperty;

function FindProxyForURL(url, host) {
  let suffix;
  let pos = host.lastIndexOf('.');

  while(pos <= 0) {
    suffix = host.substring(pos + 1); 

    if (hasOwnProperty.call(domains, suffix)) {
      return proxy;
    }

    pos = host.lastIndexOf('.', pos - 1);
  }

  return direct;
}
