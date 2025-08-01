---
title: polygon
order: 19
---

## 概述

`polygon` 图形标记（多边形），利用一组 (x, y) 数据点，来连接形成一个闭合的图形，一般都是结合社区上的可视化布局算法计算之后的数据进行可视化展示。在数据可视化、计算机图形学和地理信息系统等领域中具有重要作用，常用于 矩形树图或地图上的区块映射。

例如在战争沙盘中，可以在地图上分割出多个不规则的图形，来 显示和区分 占领和未占领、己方和敌方、河流和陆地的区域，使得更加直观的感受战场上的态势。

它是数据可视化、图形学和地理信息系统中不可或缺的工具。

```js | ob { inject: true }
import { Chart } from '@antv/g2';

const chart = new Chart({
  container: 'container',
});

// 生成正多边形的坐标点
function generatePolygon(sides, centerX, centerY, radius, rotation = 0) {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides + rotation;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push([x, y]);
  }
  return points;
}

// 创建多种正多边形数据
const polygonData = [
  {
    name: '三角形',
    sides: 3,
    color: '#FF6B6B',
    position: [2, 4],
    size: 0.8,
    rotation: Math.PI / 6,
  },
  {
    name: '四边形',
    sides: 4,
    color: '#4ECDC4',
    position: [4, 4],
    size: 0.7,
    rotation: Math.PI / 4,
  },
  {
    name: '五边形',
    sides: 5,
    color: '#45B7D1',
    position: [6, 4],
    size: 0.8,
    rotation: 0,
  },
  {
    name: '六边形',
    sides: 6,
    color: '#96CEB4',
    position: [8, 4],
    size: 0.8,
    rotation: 0,
  },
  {
    name: '八边形',
    sides: 8,
    color: '#FFEAA7',
    position: [2, 2],
    size: 0.8,
    rotation: Math.PI / 8,
  },
  {
    name: '十边形',
    sides: 10,
    color: '#DDA0DD',
    position: [4, 2],
    size: 0.8,
    rotation: 0,
  },
  {
    name: '十二边形',
    sides: 12,
    color: '#98D8C8',
    position: [6, 2],
    size: 0.8,
    rotation: 0,
  },
  {
    name: '星形',
    sides: 5,
    color: '#F7DC6F',
    position: [8, 2],
    size: 0.9,
    rotation: 0,
    star: true,
  },
];

// 转换为 G2 需要的数据格式
const data = polygonData.map((poly) => {
  let coordinates;

  if (poly.star) {
    // 生成五角星
    const outerPoints = generatePolygon(
      5,
      poly.position[0],
      poly.position[1],
      poly.size,
      poly.rotation,
    );
    const innerPoints = generatePolygon(
      5,
      poly.position[0],
      poly.position[1],
      poly.size * 0.4,
      poly.rotation + Math.PI / 5,
    );
    coordinates = [];
    for (let i = 0; i < 5; i++) {
      coordinates.push(outerPoints[i]);
      coordinates.push(innerPoints[i]);
    }
  } else {
    coordinates = generatePolygon(
      poly.sides,
      poly.position[0],
      poly.position[1],
      poly.size,
      poly.rotation,
    );
  }

  return {
    x: coordinates.map((point) => point[0]),
    y: coordinates.map((point) => point[1]),
    name: poly.name,
    color: poly.color,
    sides: poly.sides,
  };
});

chart.options({
  type: 'polygon',
  data: data,
  encode: {
    x: 'x',
    y: 'y',
    color: 'color',
    series: 'name',
  },
  scale: {
    x: { domain: [0, 10] },
    y: { domain: [0, 6] },
    color: { type: 'identity' },
  },
  style: {
    stroke: '#fff',
    lineWidth: 2,
    fillOpacity: 0.8,
  },
  labels: [
    {
      text: 'name',
      position: 'inside',
      style: {
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#333',
        textAlign: 'center',
      },
    },
  ],
  tooltip: false,
});

chart.render();
```

更多的案例，可以查看[图表示例 - 多边形](/examples#general-polygon)页面。

## 配置项

| 属性       | 描述                                                                                                  | 类型                      | 默认值                 | 必选 |
| ---------- | ----------------------------------------------------------------------------------------------------- | ------------------------- | ---------------------- | ---- |
| encode     | 配置 `polygon` 标记的视觉通道，包括`x`、`y`、`color`、`shape`等，用于指定视觉元素属性和数据之间的关系 | [encode](#encode)         | -                      | ✓    |
| coordinate | 配置 `polygon` 标记的坐标系，坐标系会执行一系列点转换，从而改变标记的空间展示形式                     | [coordinate](#coordinate) | `{type: 'cartesian' }` |      |
| style      | 配置 `polygon` 标记的图形样式                                                                         | [style](#style)           | -                      |      |

### encode

配置 `polygon` 标记的视觉通道。

| 属性  | 描述                                                                                                                                               | 类型                          | 默认值    | 必选 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------- | ---- |
| x     | 绑定 `polygon` 标记的 `x` 属性通道，一般是 `data` 中的时间或有序名词字段                                                                           | [encode](/manual/core/encode) | -         | ✓    |
| y     | 绑定 `polygon` 标记的 `y` 属性通道，一般是 `data` 中的数值或数组字段                                                                               | [encode](/manual/core/encode) | -         | ✓    |
| color | 绑定 `polygon` 标记的 `color` 属性通道，如果将数据字段映射到颜色通道，会对每个 `polygon` 多边形区块进行颜色区分,可以为温度等数值类型，也可以为分组 | [encode](/manual/core/encode) | -         |      |
| shape | 绑定 `polygon` 标记的 `shape` 属性通道，改变图形标记的绘制形状，支持的属性：`polygon` \| `ribbon`                                                  | _string_                      | `polygon` |      |

#### color

`color` 视觉通道影响 `polygon` 图形标记区域的填充颜色。`polygon` 标记中单个区域仅能使用一种颜色（或者渐变色），但如果将数据字段映射到颜色通道，会对数据进行分组，将数据拆分成多个区域：

- `color` 颜色通道, 传入 `string` 类型分组

```js | ob { inject: true }
import { Chart } from '@antv/g2';

const chart = new Chart({
  container: 'container',
});

chart.options({
  type: 'polygon',
  width: 200,
  height: 200,
  paddingTop: 0,
  paddingLeft: 0,
  paddingBottom: 0,
  paddingRight: 0,
  data: [
    { id: 'Big Triangle 1', x: [0, 2, 0], y: [0, 0, 2] },
    { id: 'Big Triangle 2', x: [0, -2, 0], y: [0, 0, 2] },
    { id: 'Medium Triangle', x: [1, 0, -1], y: [-1, -2, -1] },
    { id: 'Small Triangle 1', x: [-2, -1, -1], y: [0, 0, -1] },
    { id: 'Small Triangle 2', x: [0, 1, 0], y: [0, 0, -1] },
    { id: 'Square', x: [0, 0, -1, -1], y: [0, -1, -1, 0] },
    { id: 'Parallelogram', x: [0, 1, 2, 1], y: [-1, 0, 0, -1] },
  ],
  encode: { x: 'x', y: 'y', color: 'id' },
  scale: { x: { domain: [-2, 2] }, y: { domain: [-2, 2] } },
  style: { stroke: '#fff', lineWidth: 2 },
  axis: false,
});

chart.render();
```

- `color` 颜色通道, 传入 `number` 类型分组

```js | ob { inject: true }
import { Chart } from '@antv/g2';

const chart = new Chart({
  container: 'container',
});

chart.options({
  type: 'polygon',
  width: 200,
  height: 200,
  paddingTop: 0,
  paddingLeft: 0,
  paddingBottom: 0,
  paddingRight: 0,
  data: [
    { id: 'Big Triangle 1', x: [0, 2, 0], y: [0, 0, 2], area: 2 },
    { id: 'Big Triangle 2', x: [0, -2, 0], y: [0, 0, 2], area: 2 },
    { id: 'Medium Triangle', x: [1, 0, -1], y: [-1, -2, -1], area: 1 },
    { id: 'Small Triangle 1', x: [-2, -1, -1], y: [0, 0, -1], area: 0.5 },
    { id: 'Small Triangle 2', x: [0, 1, 0], y: [0, 0, -1], area: 0.5 },
    { id: 'Square', x: [0, 0, -1, -1], y: [0, -1, -1, 0], area: 1 },
    { id: 'Parallelogram', x: [0, 1, 2, 1], y: [-1, 0, 0, -1], area: 1 },
  ],
  encode: { x: 'x', y: 'y', color: 'area' },
  scale: { x: { domain: [-2, 2] }, y: { domain: [-2, 2] } },
  style: { stroke: '#fff', lineWidth: 2 },
  axis: false,
});

chart.render();
```

#### shape

目前 `polygon` 有 2 个内置 shape 图形，默认为 `polygon`。

| 图形    | 描述                                                                 | 示例                                                                                                             |
| ------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| polygon | 绘制一个闭合的多边形                                                 | <img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*2h-nRohPRJwAAAAAAAAAAAAAemJ7AQ/original"></img> |
| ribbon  | 绘制一个彩带，需要 p0，p1，p2，p3 四个点，p0 p1 为起点，p2 p3 为终点 | <img src="https://mdn.alipayobjects.com/huamei_qa8qxu/afts/img/A*vhqnToccotoAAAAAAAAAAAAAemJ7AQ/original"></img> |

`ribbon` 实现的案例，可以通过弦图 `chord` 和 桑基图`sankey` ，可以查看[图表示例 - 网络](/examples#graph-network)页面。

### style

| 属性          | 描述                                                                                                          | 类型                                              | 默认值    | 必选 |
| ------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------- | ---- |
| fill          | 图形的填充色                                                                                                  | `string` \| `Function<string>`                    | -         |      |
| fillOpacity   | 图形的填充透明度                                                                                              | `number` \| `Function<number>`                    | -         |      |
| stroke        | 图形的描边                                                                                                    | `string` \| `Function<string>`                    | -         |      |
| strokeOpacity | 描边透明度                                                                                                    | `number` \| `Function<number>`                    | -         |      |
| lineWidth     | 图形描边的宽度                                                                                                | `number` \| `Function<number>`                    | -         |      |
| lineDash      | 描边的虚线配置，第一个值为虚线每个分段的长度，第二个值为分段间隔的距离。lineDash 设为[0, 0]的效果为没有描边。 | `[number,number]` \| `Function<[number, number]>` | -         |      |
| opacity       | 图形的整体透明度                                                                                              | `number` \| `Function<number>`                    | -         |      |
| shadowColor   | 图形阴影颜色                                                                                                  | `string` \| `Function<string>`                    | -         |      |
| shadowBlur    | 图形阴影的高斯模糊系数                                                                                        | `number` \| `Function<number>`                    | -         |      |
| shadowOffsetX | 设置阴影距图形的水平距离                                                                                      | `number` \| `Function<number>`                    | -         |      |
| shadowOffsetY | 设置阴影距图形的垂直距离                                                                                      | `number` \| `Function<number>`                    | -         |      |
| cursor        | 鼠标样式。同 css 的鼠标样式，默认 'default'。                                                                 | `string` \| `Function<string>`                    | 'default' |      |

