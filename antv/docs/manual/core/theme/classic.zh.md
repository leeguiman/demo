---
title: classic
order: 2
---

经典主题。

## 开始使用

```js | ob { inject: true }
import { Chart } from '@antv/g2';

const chart = new Chart({ container: 'container' });

chart.options({
  type: 'interval',
  paddingLeft: 80,
  theme: 'classic',
  data: {
    type: 'fetch',
    value:
      'https://gw.alipayobjects.com/os/bmw-prod/f129b517-158d-41a9-83a3-3294d639b39e.csv',
    format: 'csv',
  },
  encode: { x: 'state', y: 'population', color: 'age' },
  transform: [
    { type: 'sortX', by: 'y', reverse: true, slice: 6 },
    { type: 'dodgeX' },
  ],
  axis: { y: { labelFormatter: '~s' }, x: { zIndex: 1 } },
  interaction: {
    tooltip: { shared: true },
    elementHighlight: { background: true },
  },
});

chart.render();
```
