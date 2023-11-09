Linux系统配置
============

# 挂载硬盘 

UUID=4020aa5c-2ba8-4e97-8d2e-b657e8ee72e2 /mnt/disk               ext4    defaults        0 0

# GRUB2安装Linux  

```
grub>set root=(hd0,2) 
grub>loopbadk loop /CentOS-8.2.2004-x86_64-minimal.iso
grub>linux (loop)/isolinux/vmlinuz linux repo=hd:/dev/sdg2:/CentOS-8.2.2004-x86_64-minimal.iso
grub>initrd (loop)/isolinux/initrd.gz 
grub>boot 
```
