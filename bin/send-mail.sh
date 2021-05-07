#!/bin/bash

echo $(systemctl status erps) | mail -Ssendwait -s ${1-TEST} wangxuemin@zzlx.org
