import React, { useState } from 'react'

interface ExampleSelectorProps {
  onLoadExample: (code: string) => void
}

const ExampleSelector: React.FC<ExampleSelectorProps> = ({ onLoadExample }) => {
  const [selectedExample, setSelectedExample] = useState('')

  const examples = [
    {
      name: '基础柱状图',
      code: `// 基础柱状图示例
const data = [
  { genre: 'Sports', sold: 275 },
  { genre: 'Strategy', sold: 115 },
  { genre: 'Action', sold: 120 },
  { genre: 'Shooter', sold: 350 },
  { genre: 'Other', sold: 150 },
];

const chart = new Chart({
  container: container,
  autoFit: true,
  height: 400,
});

chart.data(data);

chart
  .interval()
  .encode('x', 'genre')
  .encode('y', 'sold')
  .encode('color', 'genre');

chart.render();

return chart;`
    },
    {
      name: '折线图',
      code: `// 折线图示例
const data = [
  { year: '1991', value: 3 },
  { year: '1992', value: 4 },
  { year: '1993', value: 3.5 },
  { year: '1994', value: 5 },
  { year: '1995', value: 4.9 },
  { year: '1996', value: 6 },
  { year: '1997', value: 7 },
  { year: '1998', value: 9 },
  { year: '1999', value: 13 },
];

const chart = new Chart({
  container: container,
  autoFit: true,
  height: 400,
});

chart.data(data);

chart
  .line()
  .encode('x', 'year')
  .encode('y', 'value')
  .style('stroke', '#1890ff')
  .style('lineWidth', 2);

chart
  .point()
  .encode('x', 'year')
  .encode('y', 'value')
  .style('fill', '#1890ff')
  .style('r', 3);

chart.render();

return chart;`
    },
    {
      name: '饼图',
      code: `// 饼图示例
const data = [
  { type: 'a', value: 27 },
  { type: 'b', value: 25 },
  { type: 'c', value: 18 },
  { type: 'd', value: 15 },
  { type: 'e', value: 10 },
  { type: 'f', value: 5 },
];

const chart = new Chart({
  container: container,
  autoFit: true,
  height: 400,
});

chart.data(data);

chart.coordinate({ type: 'theta', outerRadius: 0.8 });

chart
  .interval()
  .transform({ type: 'stackY' })
  .encode('y', 'value')
  .encode('color', 'type')
  .legend('color', { position: 'bottom', layout: { justifyContent: 'center' } })
  .label({
    position: 'outside',
    text: (data) => \`\${data.type}: \${data.value}\`,
  })
  .tooltip((data) => ({
    name: data.type,
    value: data.value,
  }));

chart.render();

return chart;`
    },
    {
      name: '散点图',
      code: `// 散点图示例
const data = [
  { x: 1, y: 4.2 },
  { x: 2, y: 5.4 },
  { x: 3, y: 7.1 },
  { x: 4, y: 6.8 },
  { x: 5, y: 8.9 },
  { x: 6, y: 10.2 },
  { x: 7, y: 11.5 },
  { x: 8, y: 12.8 },
  { x: 9, y: 14.1 },
  { x: 10, y: 15.6 },
];

const chart = new Chart({
  container: container,
  autoFit: true,
  height: 400,
});

chart.data(data);

chart
  .point()
  .encode('x', 'x')
  .encode('y', 'y')
  .encode('size', 4)
  .style('fill', '#1890ff')
  .style('fillOpacity', 0.6);

chart.render();

return chart;`
    }
  ]

  const loadExample = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const exampleName = e.target.value
    setSelectedExample(exampleName)
    const example = examples.find(ex => ex.name === exampleName)
    if (example) {
      onLoadExample(example.code)
    }
  }

  return (
    <div className="example-selector">
      <h4>示例代码</h4>
      <select value={selectedExample} onChange={loadExample} className="example-select">
        <option value="">选择一个示例...</option>
        {examples.map((example) => (
          <option key={example.name} value={example.name}>
            {example.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ExampleSelector