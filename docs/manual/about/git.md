Git
=====

# 常用操作

* 查看冲突文件列表

```
git diff --name-only --diff-filter=U
```

* 展示工作区和暂存区的不同

```
git diff
```

* 展示暂存区和最近版本的不同

```
git diff --cached
```

* 展示暂存区、工作区和最近版本的不同

```
git diff HEAD
```

* 快速切换到上一个分支

```
git checkout -
```

* 展示本地分支关联远程仓库的情况 

```
git branch -vv
```

* 关联远程分支

```
git branch -u origin/mybranch
```

* 列出所有远程分支

```
git branch -r
```

* 列出本地和远程分支

```
git branch -a
```

* 查看远程分支和本地分支的对应关系

```
git remote show origin
```

* 远程删除了分支本地也想删除

```
git remote prune origin
```

* 创建并切换到本地分支

```
git checkout -b <branch-name>
```

* 从远程分支中创建并切换到本地分支

```
git checkout -b <branch-name> origin/<branch-name>
```

* 删除本地分支

```
git branch -d <local-branchname>
```

* 删除远程分支

```
git push origin --delete <remote-branchname>
```


* 查看标签
```
git tag
```

* 展示当前分支的最近的 tag
```
git describe --tags --abbrev=0
```

* 推送标签到远程仓库
```
git push origin <local-version-number>
```

```

* 修改上一个 commit 的描述
```
git commit --amend
```

* 查看某段代码是谁写的

```
git blame <file-name>
```
