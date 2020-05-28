系统配置
=======


# 服务配置

## Apache httpd

* httpd.service

```text
[Unit]
Description=The Apache HTTP Server
After=network.target remote-fs.target nss-lookup.target
Documentation=man:httpd(8)
Documentation=man:apachectl(8)

[Service]
Type=fork
#EnvironmentFile=/etc/sysconfig/httpd
ExecStart=/usr/sbin/httpd $OPTIONS -DFOREGROUND
ExecReload=/usr/sbin/httpd $OPTIONS -k graceful
ExecStop=/bin/kill -WINCH ${MAINPID}
KillSignal=SIGCONT
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

## mongodb

* mongod.conf

```
# mongod.conf

# for documentation of all options, see:
#   http://docs.mongodb.org/manual/reference/configuration-options/

# where to write logging data.
systemLog:
  destination: file
  path: /mnt/disk/mongo/log/mongod.log
  logAppend: true

# Where and how to store data.
storage:
  dbPath: /mnt/disk/mongo/data
  journal:
    enabled: true
#  engine:
#  wiredTiger:
  directoryPerDB: true

# how the process runs
processManagement:
  fork: false  # fork and run in background
  pidFilePath: /var/run/mongodb/mongod.pid  # location of pidfile
  timeZoneInfo: /usr/share/zoneinfo

# network interfaces
net:
  #bindIp: 127.0.0.1  # Enter 0.0.0.0,:: to bind to all IPv4 and IPv6 addresses or, alternatively, use the net.bindIpAll setting.
  bindIp: 127.0.0.1
  port: 27017

#security:
security:
  authorization: enabled

#operationProfiling:

#replication:

#sharding:

## Enterprise-Only Options

#auditLog:

#snmp:

```

* mongod.service

```
[Unit]
Description=MongoDB Database Server
After=network.target

[Service]
User=mongod
Group=mongod
Environment="OPTIONS=-f /etc/mongod.conf"
EnvironmentFile=-/etc/sysconfig/mongod
ExecStart=/usr/bin/mongod $OPTIONS
ExecStartPre=/usr/bin/mkdir -p /var/run/mongodb
ExecStartPre=/usr/bin/chown mongod:mongod /var/run/mongodb
ExecStartPre=/usr/bin/chmod 0755 /var/run/mongodb
PermissionsStartOnly=true
PIDFile=/var/run/mongodb/mongod.pid
Type=forking
# file size
LimitFSIZE=infinity
# cpu time
LimitCPU=infinity
# virtual memory size
LimitAS=infinity
# open files
LimitNOFILE=64000
# processes/threads
LimitNPROC=64000
# locked memory
LimitMEMLOCK=infinity
# total threads (user+kernel)
TasksMax=infinity
TasksAccounting=false
# Recommended limits for for mongod as specified in
# http://docs.mongodb.org/manual/reference/ulimit/#recommended-settings

[Install]
WantedBy=multi-user.target
```

# 防火墙配置

## Linux 防火墙

1. 查看规则

```
# iptables -t filter -L

```
## Mac OSX防火墙

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

# DNS配置

## IPV6DNS

阿里IPv6 DNS (Alidns)

* 2400:3200::1
* 2400:3200:BABA:1

百度IPv6 DNS

* 2400:da00::6666

中国电信 IPv6 DNS

* 240e:4c:4008::1
* 240e:4c:4808::1

CNNIC IPv6 DNS 服务器

* 2001:dc7:1000::1

Google Public IPv6 DNS

* 2001:4860:4860::8888
* 2001:4860:4860::8844

# 其他配置

## 数据维护

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
