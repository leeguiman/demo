<template>
  <div class="chart-canvas">
    <div class="canvas-header">
      <h3>图表预览</h3>
      <button @click="clearCanvas" class="clear-button">
        清空画布
      </button>
    </div>
    <div ref="chartContainer" class="chart-container">
      <div v-if="!hasChart" class="empty-state">
        <div class="empty-icon">📊</div>
        <p>在左侧编辑器中输入AntV代码，然后点击"运行代码"查看效果</p>
      </div>
    </div>
    <div v-if="error" class="error-message">
      <h4>执行错误:</h4>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Chart } from '@antv/g2'

const chartContainer = ref<HTMLElement>()
const hasChart = ref(false)
const error = ref('')

let currentChart: Chart | null = null

const props = defineProps<{
  code: string
}>()

const clearCanvas = () => {
  if (currentChart) {
    currentChart.destroy()
    currentChart = null
  }
  hasChart.value = false
  error.value = ''
}

const executeCode = (code: string) => {
  if (!chartContainer.value) return

  try {
    error.value = ''
    
    // 清除之前的图表
    if (currentChart) {
      currentChart.destroy()
      currentChart = null
    }
    
    // 清空容器
    chartContainer.value.innerHTML = ''
    
    // 创建新的容器div
    const chartDiv = document.createElement('div')
    chartDiv.style.width = '100%'
    chartDiv.style.height = '100%'
    chartContainer.value.appendChild(chartDiv)

    // 创建安全的执行环境
    const safeCode = `
      (function() {
        const container = arguments[0];
        const Chart = arguments[1];
        
        ${code}
        
        return chart;
      })
    `

    // 执行代码
    const func = eval(safeCode)
    const chart = func(chartDiv, Chart)
    
    if (chart && typeof chart.render === 'function') {
      currentChart = chart
      hasChart.value = true
    } else {
      throw new Error('代码必须返回一个有效的Chart实例')
    }
    
  } catch (err) {
    console.error('Chart execution error:', err)
    error.value = err instanceof Error ? err.message : String(err)
    hasChart.value = false
  }
}

// 监听代码变化
const runCode = (code: string) => {
  executeCode(code)
}

defineExpose({
  runCode,
  clearCanvas
})
</script>

<style scoped>
.chart-canvas {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.canvas-header h3 {
  margin: 0;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.clear-button {
  background: #ff4757;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background: #ff3742;
}

.chart-container {
  flex: 1;
  min-height: 0;
  position: relative;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  max-width: 300px;
}

.error-message {
  background: #fff5f5;
  border-top: 1px solid #fed7d7;
  padding: 12px 16px;
  max-height: 150px;
  overflow-y: auto;
}

.error-message h4 {
  margin: 0 0 8px 0;
  color: #e53e3e;
  font-size: 12px;
  font-weight: 600;
}

.error-message pre {
  margin: 0;
  font-size: 11px;
  color: #c53030;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>