服务端框架
========

# 部署系统服务

## 数据库环境

## 网络环境

### Linux 防火墙

1. 查看规则

```
# iptables -t filter -L

```
### Mac OSX防火墙

映射80端口到3000
映射443端口到4000
/etc/pf.conf文件中添加如下规则：
rdr on lo0 inet proto tcp from any to 127.0.0.1 port 80 -> 127.0.0.1 port 3000 
rdr on lo0 inet proto tcp from any to 127.0.0.1 port 443 -> 127.0.0.1 port 4000 

### Linux firwalld配置

```
<?xml version="1.0" encoding="utf-8"?>
<zone>
  <short>Public</short>
  <description>For use in public areas. You do not trust the other computers on networks to not harm your computer. Only selected incoming connections are accepted.</description>
  <service name="ssh"/>
  <service name="dhcpv6-client"/>
  <port protocol="tcp" port="80"/>
  <port protocol="tcp" port="443"/>
  <port protocol="tcp" port="27017"/>
  <forward-port to-port="3000" protocol="tcp" port="80"/>
</zone>
```
# 数据维护


```cmd
C:\Documents and Settings\Administrator>osql -E

1> sp_password null,'abc123','sa'

2> go

Password changed.
1> exit

```
# 如何开启mac读写NTFS功能

Mac OS X系统默认不开启写NTFS格式磁盘功能，可通过如下步骤开启：

## 第一步 替换系统脚本 

```
sudo mv /sbin/mount_ntfs /sbin/mount_ntfs.orig
sudo vim /sbin/mount_ntfs
```
> Tips: 
> MAC系统文件默认开启写保护，关闭方法为重启开机进入修复模式，打开命令行终端后运行csrutil disable

添加如下内容后保存：
```
#!/bin/sh
/sbin/mount_ntfs.orig -o rw,nobrowse "$@";
```
![图片](../images/mount_ntfs.png)


## 第二步 为mount_ntfs脚本添加执行权限

```
sudo chmod o+x /sbin/mount_ntfs
```

## 第三步 添加桌面链接

```
ln -s /Volumes ~/Desktop/Volumes
```
