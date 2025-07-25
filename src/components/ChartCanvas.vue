<template>
  <div class="chart-canvas">
    <div class="canvas-header">
      <h3>图表预览</h3>
      <button @click="clearCanvas" class="clear-button">
        清空画布
      </button>
    </div>
    
    <!-- 页签导航 -->
    <div class="tab-navigation">
      <button 
        :class="['tab-button', { active: activeTab === 'chart' }]"
        @click="activeTab = 'chart'"
      >
        图表预览
      </button>
      <button 
        :class="['tab-button', { active: activeTab === 'data' }]"
        @click="activeTab = 'data'"
      >
        数据预览
      </button>
    </div>
    
    <!-- 图表预览页签 -->
    <div ref="chartContainer" class="chart-container">
      <div v-show="activeTab === 'chart'" class="tab-content">
        <div ref="g2ChartMountPoint" class="g2-chart-mount"></div>
        <div v-if="!hasChart" class="empty-state">
          <div class="empty-icon">📊</div>
          <p>在左侧编辑器中输入AntV代码，然后点击"运行代码"查看效果</p>
        </div>
      </div>
      
      <!-- 数据预览页签 -->
      <div v-show="activeTab === 'data'" class="tab-content data-preview">
        <div v-if="chartData.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>运行代码后可以在这里查看图表数据</p>
        </div>
        <div v-else class="data-table-container">
          <div class="data-info">
            <span class="data-count">共 {{ chartData.length }} 条数据</span>
          </div>
          <div class="data-table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th v-for="column in dataColumns" :key="column">{{ column }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in chartData" :key="index">
                  <td v-for="column in dataColumns" :key="column">
                    {{ formatCellValue(row[column]) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <h4>执行错误:</h4>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Chart } from '@antv/g2'

const chartContainer = ref<HTMLElement>()
const g2ChartMountPoint = ref<HTMLElement>()
const hasChart = ref(false)
const error = ref('')
const activeTab = ref<'chart' | 'data'>('chart')
const chartData = ref<any[]>([])

let currentChart: Chart | null = null

const props = defineProps<{
  code: string
}>()

// 计算数据列名
const dataColumns = computed(() => {
  if (chartData.value.length === 0) return []
  return Object.keys(chartData.value[0])
})

// 格式化单元格值
const formatCellValue = (value: any) => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const clearCanvas = () => {
  if (currentChart) {
    currentChart.destroy()
    currentChart = null
  }
  hasChart.value = false
  error.value = ''
  chartData.value = []
  activeTab.value = 'chart'
}

const executeCode = (code: string) => {
  if (!g2ChartMountPoint.value) return

  try {
    error.value = ''
    
    // 清除之前的图表
    if (currentChart) {
      currentChart.destroy()
      currentChart = null
    }
    
    // 清空G2图表挂载点
    g2ChartMountPoint.value.innerHTML = ''
    
    // 创建安全的执行环境
    const safeCode = `
      (function() {
        const container = arguments[0];
        const Chart = arguments[1];
        
        ${code}
        
        // 确保返回chart实例
        if (typeof chart !== 'undefined') {
          return chart;
        } else {
          throw new Error('代码必须创建并返回一个chart变量');
        }
      })
    `

    // 执行代码
    const func = eval(safeCode)
    const chart = func(g2ChartMountPoint.value, Chart)
    
    if (chart && typeof chart.render === 'function') {
      currentChart = chart
      hasChart.value = true
      
      // 提取图表数据
      try {
        const data = chart.options?.data || []
        chartData.value = Array.isArray(data) ? data : []
      } catch (dataError) {
        console.warn('无法提取图表数据:', dataError)
        chartData.value = []
      }
    } else {
      throw new Error('代码必须返回一个有效的Chart实例')
    }
    
  } catch (err) {
    console.error('Chart execution error:', err)
    error.value = err instanceof Error ? err.message : String(err)
    hasChart.value = false
    chartData.value = []
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

.tab-navigation {
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  flex: 1;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: #666;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  background: #f0f0f0;
  color: #333;
}

.tab-button.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  background: #ffffff;
}

.chart-container {
  flex: 1;
  min-height: 0;
  position: relative;
}

.tab-content {
  width: 100%;
  height: 100%;
  position: relative;
}

.g2-chart-mount {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
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

.data-preview {
  padding: 16px;
  overflow: hidden;
}

.data-table-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.data-info {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.data-count {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.data-table-wrapper {
  flex: 1;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.data-table th {
  background: #fafafa;
  padding: 8px 12px;
  text-align: left;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.data-table tbody tr:hover {
  background: #f9f9f9;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
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
const g2ChartMountPoint = ref<HTMLElement>()
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
  if (!g2ChartMountPoint.value) return

  try {
    error.value = ''
    
    // 清除之前的图表
    if (currentChart) {
      currentChart.destroy()
      currentChart = null
    }
    
    // 清空G2图表挂载点
    g2ChartMountPoint.value.innerHTML = ''
    
    // 创建安全的执行环境
    const safeCode = `
      (function() {
        const container = arguments[0];
        const Chart = arguments[1];
        
        ${code}
        
        // 确保返回chart实例
        if (typeof chart !== 'undefined') {
          return chart;
        } else {
          throw new Error('代码必须创建并返回一个chart变量');
        }
      })
    `

    // 执行代码
    const func = eval(safeCode)
    const chart = func(g2ChartMountPoint.value, Chart)
    
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

.g2-chart-mount {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
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