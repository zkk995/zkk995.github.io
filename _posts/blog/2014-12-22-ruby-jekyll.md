---
layout: post
title: Windows使用jekyll
description: 安装ruby, 安装jekyll，本地预览博客。
category: blog
---




## 安装ruby 

下载 DevKit-mingw64-64-4.7.2-20130224-1432-sfx.exe
和rubyinstaller-2.1.5-x64.exe

1. Ruby  注: 勾选添加ruby到PATH路径中
2. Ruby DevKit
    - cd C:\RubyDevKit
    - ruby dk.rb init # config.yml中添加: - C:/Ruby21-x64
    - ruby dk.rb install

* gem仓库更改

```
$ gem sources --remove https://rubygems.org/
$ gem sources -a https://ruby.taobao.org/
$ gem sources -l
*** CURRENT SOURCES ***

https://ruby.taobao.org
# 请确保只有 ruby.taobao.org
$ gem install rails
```

## 安装jekyll

```
gem install rdiscount
gem install jekyll
cd E:\zkk995.github.io
jekyll serve #启动
```

## 参考 

1. http://jekyll-windows.juthilo.com/1-ruby-and-devkit/
2. https://ruby.taobao.org/
3. http://jekyllrb.com/
