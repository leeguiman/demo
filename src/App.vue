<template>
  <div class="app">
    <header class="app-header">
      <h1>AntV 通用画布</h1>
      <p>左侧编辑代码，右侧查看图表效果</p>
    </header>
    
    <main class="app-main">
      <div class="left-panel">
        <ExampleSelector @load-example="loadExample" />
        <CodeEditor 
          v-model="code" 
          @run-code="runCode"
        />
      </div>
      
      <div class="right-panel">
        <ChartCanvas 
          ref="chartCanvas"
          :code="code"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CodeEditor from './components/CodeEditor.vue'
import ChartCanvas from './components/ChartCanvas.vue'
import ExampleSelector from './components/ExampleSelector.vue'

const chartCanvas = ref()

const code = ref(`// 在这里编写你的AntV代码
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
  if (chartCanvas.value) {
    chartCanvas.value.runCode(codeToRun)
  }
}

const loadExample = (exampleCode: string) => {
  code.value = exampleCode
}
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.app-header {
  background: #ffffff;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.app-header p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.app-main {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  min-height: 0;
}

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 400px;
}

.right-panel {
  flex: 1;
  min-width: 400px;
}
</style>