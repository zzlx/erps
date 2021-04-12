#!/bin/bash

echo $(systemctl status erps.service) | mail -Ssendwait -s ${1-TEST} wangxuemin@zzlx.org
