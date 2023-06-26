# ACME

Automatic Certificate Management Environment (ACME) [RFC 8555](https://tools.ietf.org/html/rfc8555)
自动化证书管理环境, 


## 自签名证书 

```
openssl req -new -x509 -days 365 -key macair-key.pem -out macair-cert.pem -subj "/C=CN/L=ZhengZhou/O=zzlx/CN=macair"
```

## Let's Encrypt 

[letsencrypt](https://letsencrypt.org)

## OCSP

Online Certificate Status Protocol(OCSP)
