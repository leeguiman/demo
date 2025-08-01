---
title: jitterX
order: 2
---

## 概述

`jitterX` 是 [jitter](/manual/core/transform/jitter) 的快捷函数，专门用于处理离散的 `x` 通道比例尺，生成 `dx` 通道，实现在某个区域的 `x` 方向散开的效果。
它通过在 x 轴上添加随机偏移量，使得数据点在视觉上分散开，从而避免重叠和提高可读性。

## 使用场景

`jitterX` 适用场景和 `jitter` 一致，主要用于散点图、蜂巢图等需要展示个体数据的图表。它可以帮助用户更好地理解数据分布，尤其是在数据点密集的情况下。

## 配置项

| 属性    | 描述                       | 类型           | 默认值      |
| ------- | -------------------------- | -------------- | ----------- |
| padding | 每个分组之间的间距 [0 ~ 1] | `number`       | 0           |
| random  | 随机函数，返回值为 [0, 1)  | `() => number` | Math.random |

## 示例

简单的示例可以参考 [jitter](/manual/core/transform/jitter) 的示例，下面针对 `jitterX` 函数的场景使用进行说明和演示。

```js | ob { inject: true }
const { Chart } = G2;
const chart = new Chart({
  container: 'container',
});
chart.options({
  type: 'point',
  data: {
    type: 'fetch',
    value:
      'https://gw.alipayobjects.com/os/bmw-prod/2c813e2d-2276-40b9-a9af-cf0a0fb7e942.csv',
  },
  encode: {
    y: 'Horsepower',
    x: 'Cylinders',
    shape: 'hollow',
    color: 'Cylinders',
  },
  transform: [{ type: 'sortX', channel: 'x' }, { type: 'jitterX' }],
  scale: { x: { type: 'point' }, color: { type: 'ordinal' } },
});

chart.render();
```

补充说明：和 `jitter` 函数一样，`jitterX` 是一种视觉调整方法，可能会稍微改变数据的精确位置，因此不适合对位置精度要求极高的场景。
在使用 `jitterX` 时，建议根据具体数据和需求进行适当的参数调整，以达到最佳的视觉效果和数据展示效果。
