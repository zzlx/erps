未分类
==========

WXM转mp4


FFMPEG -i 1.wmv -c:v libx264 -strict -2 1_wmv.mp4
合并视频
命令：ffmpeg -f concat -i 1.txt -c copy out.flv

## Git日志显示格式

git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr)%Creset' --abbrev-commit --date=relative
