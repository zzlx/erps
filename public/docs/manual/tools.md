# 工具的使用

---


## nmcli

nmcli - command-line tool for controlling NetworkManager

* 查看网络连接

```
nmcli --show
```

## 生成证书 

```
openssl req -newkey rsa:2048 -nodes -keyout /etc/vsftpd/key.pem \
-x509 -days 365 -out /etc/vsftpd/cert.pem \
-subj "/C=CN/ST=HA/L=zzlx/O=zzlx/OU=zzlx/CN=zzlx.org/emailAddress=wangxuemin@zzlx.org"
```
