---
layout: post
title: 数学公式显示
category: project
description: 抄过来的模版不支持数学公式和表格， 做一些简单修改。
---

### 数学公式

$$ -1 = e^{\pi i}$$
 
一行代码能显示吗 $ -1 = e^{\pi i} $

`\[
\int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15}
\notag
\]`

`
\begin{align}
g(x) &= \frac13 \sum_j^N f_j(x) \\
g(x) &= \frac13 \sum_j^N \frac1{\frac1{3+7}} 
\end{align}
`

注意了， 下面两个显示方式， 有点不一致。 

```latex
`
\[
\int_0^\infty \frac{x^3}{e^x-1}\,dx = \frac{\pi^4}{15}
\notag
\]
`
`
\begin{align}
g(x) &= \frac13 \sum_j^N f_j(x) \\
g(x) &= \frac13 \sum_j^N \frac1{\frac1{3+7}} 
\end{align}
`
```

### 高亮一段代码

``` python
@requires_authorization
class SomeClass:
    pass

if __name__ == '__main__':
    # A comment
    print 'hello world'
```

### 绘制表格

| 项目        | 价格   |  数量  |
| --------   | -----:  | :----:  |
| 计算机     | $1600 |   5     |
| 手机        |   $12   |   12   |
| 管很让人线        |    $1    |  234  |
| 管线   收入贴合     |    $1 幅度高达都是   |  234sdgfdsg  |
