---
title: filter
order: 2
---

对数据进行指定条件的过滤。类似于 [Array.prototype.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)。

## 开始使用

```ts
const data = [
  { a: 1, b: 2, c: 3 },
  { a: 4, b: 5, c: 6 },
];

chart.data({
  type: 'inline',
  value: data,
  transform: [
    {
      type: 'filter',
      callback: (d) => d.a < 3,
    },
  ],
});
```

上述例子处理之后，数据变成为：

```js
[{ a: 1, b: 2, c: 3 }];
```

## 选项

| 属性     | 描述                                 | 类型                                           | 默认值                                                     |
| -------- | ------------------------------------ | ---------------------------------------------- | ---------------------------------------------------------- |
| callback | 函数，传入当前数据，输出处理后的数据 | `(d: any, idx: number, arr: any[]) => boolean` | `(d) => d !== undefined && d !== null && !Number.isNaN(d)` |
