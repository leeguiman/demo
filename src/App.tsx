import React, { useState, useRef } from 'react'
import CodeEditor from './components/CodeEditor'
import ChartCanvas from './components/ChartCanvas'
import ExampleSelector from './components/ExampleSelector'

const App: React.FC = () => {
  const chartCanvasRef = useRef<{ runCode: (code: string) => void }>(null)

  const [code, setCode] = useState(`// 在这里编写你的AntV代码
// 示例：创建一个简单的柱状图

const data = [
  { name: 'A', value: 40 },
  { name: 'B', value: 21 },
  { name: 'C', value: 17 },
  { name: 'D', value: 13 },
  { name: 'E', value: 9 }
];

const chart = new Chart({
  container: container,
  autoFit: true,
  height: 400,
});

chart.data(data);

chart
  .interval()
  .encode('x', 'name')
  .encode('y', 'value')
  .encode('color', 'name');

chart.render();

// 必须返回chart实例
return chart;`)

  const runCode = (codeToRun: string) => {
    if (chartCanvasRef.current) {
      chartCanvasRef.current.runCode(codeToRun)
    }
  }

  const loadExample = (exampleCode: string) => {
    setCode(exampleCode)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>AntV 通用画布</h1>
        <p>左侧编辑代码，右侧查看图表效果</p>
      </header>
      
      <main className="app-main">
        <div className="left-panel">
          <ExampleSelector onLoadExample={loadExample} />
          <CodeEditor 
            value={code} 
            onChange={setCode}
            onRunCode={runCode}
          />
        </div>
        
        <div className="right-panel">
          <ChartCanvas 
            ref={chartCanvasRef}
            code={code}
          />
        </div>
      </main>
    </div>
  )
}

export default App