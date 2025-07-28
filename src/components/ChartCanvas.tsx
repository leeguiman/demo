import React, { useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react'
import { Chart } from '@antv/g2'

interface ChartCanvasProps {
  code: string
}

export interface ChartCanvasRef {
  runCode: (code: string) => void
  clearCanvas: () => void
}

const ChartCanvas = forwardRef<ChartCanvasRef, ChartCanvasProps>(({ code }, ref) => {
  const g2ChartMountPointRef = useRef<HTMLDivElement>(null)
  const [hasChart, setHasChart] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'chart' | 'data'>('chart')
  const [chartData, setChartData] = useState<any[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  let currentChart: Chart | null = null

  // 计算数据列名
  const dataColumns = useMemo(() => {
    if (chartData.length === 0) return []
    return Object.keys(chartData[0])
  }, [chartData])

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
    setHasChart(false)
    setError('')
    setChartData([])
    setActiveTab('chart')
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    
    // 全屏切换后需要重新调整图表大小
    if (currentChart) {
      setTimeout(() => {
        // 强制图表重新计算容器大小并适应
        currentChart?.forceFit()
        currentChart?.render()
      }, 100)
    }
  }

  const downloadChart = async () => {
    if (!currentChart || !g2ChartMountPointRef.current) return
    
    try {
      // 获取图表标题作为文件名
      let filename = 'chart'
      
      // 调试：打印图表对象的所有可能包含标题的属性
      console.log('Chart object keys:', Object.keys(currentChart))
      console.log('Chart options:', currentChart.options)
      
      // 尝试多种方式获取标题
      const titleSources = [
        // 方法1: 从options获取
        () => currentChart.options?.title?.title,
        // 方法2: 从getOptions获取
        () => currentChart.getOptions?.()?.title?.title,
        // 方法3: 从spec获取
        () => currentChart.getSpec?.()?.title?.title,
        // 方法4: 从图表的内部状态获取
        () => {
          if (currentChart.view && currentChart.view.options) {
            return currentChart.view.options.title?.title
          }
          return null
        },
        // 方法5: 检查是否有title方法返回的配置
        () => {
          // 遍历图表的所有属性寻找title配置
          for (const key in currentChart) {
            const value = currentChart[key]
            if (value && typeof value === 'object' && value.title && typeof value.title === 'string') {
              return value.title
            }
          }
          return null
        }
      ]
      
      // 依次尝试每种方法
      for (let i = 0; i < titleSources.length; i++) {
        try {
          const title = titleSources[i]()
          console.log(`方法${i + 1}获取到的标题:`, title)
          if (title && typeof title === 'string') {
            filename = title
            break
          }
        } catch (e) {
          console.log(`方法${i + 1}失败:`, e)
        }
      }
      
      console.log('最终使用的文件名:', filename)
      
      // 清理文件名，移除特殊字符
      filename = String(filename).replace(/[^\w\u4e00-\u9fa5\s-]/g, '').trim()
      if (!filename) {
        filename = 'chart'
      }
      
      // 使用G2的toDataURL方法导出图片
      const canvas = g2ChartMountPointRef.current.querySelector('canvas')
      if (!canvas) {
        console.error('未找到图表canvas元素')
        return
      }
      
      // 创建一个新的canvas来确保背景是白色的
      const exportCanvas = document.createElement('canvas')
      const ctx = exportCanvas.getContext('2d')
      
      if (!ctx) return
      
      exportCanvas.width = canvas.width
      exportCanvas.height = canvas.height
      
      // 设置白色背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
      
      // 绘制图表内容
      ctx.drawImage(canvas, 0, 0)
      
      // 转换为blob并下载
      exportCanvas.toBlob((blob) => {
        if (!blob) return
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${filename}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png')
      
    } catch (error) {
      console.error('下载图表失败:', error)
      // 如果上述方法失败，尝试使用G2的内置方法
      try {
        if (currentChart.downloadImage) {
          currentChart.downloadImage(filename)
        }
      } catch (fallbackError) {
        console.error('备用下载方法也失败:', fallbackError)
      }
    }
  }

  const executeCode = (code: string) => {
    if (!g2ChartMountPointRef.current) return

    try {
      setError('')
      
      // 清除之前的图表
      if (currentChart) {
        currentChart.destroy()
        currentChart = null
      }
      
      // 清空G2图表挂载点
      g2ChartMountPointRef.current.innerHTML = ''
      
      // 重写用户代码中的固定尺寸设置
      const modifiedCode = code
        .replace(/width:\s*\d+/g, 'autoFit: true')
        .replace(/height:\s*\d+/g, 'autoFit: true')
        .replace(/container:\s*['"]container['"]/, 'container: container');
      
      // 使用 new Function 创建安全的执行环境
      const func = new Function('container', 'Chart', `
        ${modifiedCode}
        // 确保返回chart实例
        if (typeof chart !== 'undefined') {
          return chart;
        } else {
          throw new Error('代码必须创建并返回一个chart变量');
        }
      `);

      // 执行代码
      const result = func(g2ChartMountPointRef.current, Chart)
      
      if (result && typeof result.render === 'function') {
        currentChart = result
        setHasChart(true)
        
        // 确保图表自适应容器大小，特别是在全屏模式下
        setTimeout(() => {
          result.forceFit()
          // 如果当前是全屏模式，额外调用一次render确保正确显示
          if (isFullscreen) {
            result.render()
          }
        }, 100)
        
        // 提取图表数据
        try {
          // 尝试多种方式获取图表数据
          let data = []
          
          // 方法1: 从chart.options.data获取
          if (result.options && result.options.data) {
            data = result.options.data
          }
          // 方法2: 从chart的内部状态获取
          else if (result.getOptions && result.getOptions().data) {
            data = result.getOptions().data
          }
          // 方法3: 从图表的数据源获取
          else if (result.getData && typeof result.getData === 'function') {
            data = result.getData()
          }
          // 方法4: 检查是否有spec.data
          else if (result.spec && result.spec.data) {
            data = result.spec.data
          }
          
          console.log('提取到的图表数据:', data)
          setChartData(Array.isArray(data) ? data : [])
        } catch (dataError) {
          console.warn('无法提取图表数据:', dataError)
          setChartData([])
        }
      } else {
        throw new Error('代码必须返回一个有效的Chart实例')
      }
      
    } catch (err) {
      console.error('Chart execution error:', err)
      setError(err instanceof Error ? err.message : String(err))
      setHasChart(false)
      setChartData([])
    }
  }

  // 监听代码变化
  const runCode = (code: string) => {
    executeCode(code)
  }

  useImperativeHandle(ref, () => ({
    runCode,
    clearCanvas
  }))

  return (
    <div className="chart-canvas">
      <div className="canvas-header">
        <h3>图表预览</h3>
        <div className="header-buttons">
          {activeTab === 'chart' && hasChart && (
            <button onClick={toggleFullscreen} className="fullscreen-button">
              {isFullscreen ? '退出全屏' : '全屏预览'}
            </button>
          )}
          {activeTab === 'chart' && hasChart && (
            <button onClick={downloadChart} className="download-button">
              下载图片
            </button>
          )}
          <button onClick={clearCanvas} className="clear-button">
            清空画布
          </button>
        </div>
      </div>
      
      {/* 页签导航 */}
      {!isFullscreen && (
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'chart' ? 'active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            图表预览
          </button>
          <button 
            className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            数据预览
          </button>
        </div>
      )}
      
      {/* 图表预览页签 */}
      <div className={`chart-container ${isFullscreen ? 'fullscreen' : ''}`}>
        {/* 全屏模式下的控制栏 */}
        {isFullscreen && (
          <div className="fullscreen-controls">
            <h3>图表预览 - 全屏模式</h3>
            <div className="fullscreen-buttons">
              <button onClick={downloadChart} className="download-button">
                下载图片
              </button>
              <button onClick={toggleFullscreen} className="exit-fullscreen-button">
                退出全屏
              </button>
            </div>
          </div>
        )}
        
        {activeTab === 'chart' && (
          <div className="tab-content chart-tab">
            <div ref={g2ChartMountPointRef} className="g2-chart-mount"></div>
            {!hasChart && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <p>在左侧编辑器中输入AntV代码，然后点击"运行代码"查看效果</p>
              </div>
            )}
          </div>
        )}
        
        {/* 数据预览页签 */}
        {activeTab === 'data' && (
          <div className="tab-content data-preview">
            {chartData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>运行代码后可以在这里查看图表数据</p>
              </div>
            ) : (
              <div className="data-table-container">
                <div className="data-info">
                  <span className="data-count">共 {chartData.length} 条数据</span>
                </div>
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        {dataColumns.map((column) => (
                          <th key={column}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((row, index) => (
                        <tr key={index}>
                          {dataColumns.map((column) => (
                            <td key={column}>
                              {formatCellValue(row[column])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {error && !isFullscreen && (
        <div className="error-message">
          <h4>执行错误:</h4>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  )
})

ChartCanvas.displayName = 'ChartCanvas'

export default ChartCanvas