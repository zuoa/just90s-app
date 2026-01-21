import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'
import { useAudioGuide } from './hooks/useAudioGuide'
import { TEXTS, randomChoice } from './config/texts'

// 流程阶段定义
type Phase = 'start' | 'acknowledge' | 'breathing' | 'waiting' | 'complete'

function App() {
  const [phase, setPhase] = useState<Phase>('start')
  const [interruption, setInterruption] = useState(false)
  const [audioEnabled] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0) // 添加倒计时
  const [breathText, setBreathText] = useState('吸气') // 呼吸提示文案
  const [waitingText, setWaitingText] = useState('这股感觉正在自然下降') // 等待阶段文案
  const phaseRef = useRef(phase)

  // 随机选择的文案（每次会话开始时更新）
  const [selectedTexts, setSelectedTexts] = useState<{
    startTitle: string
    startSubtitle: string
    startDescription: string
    startButton: string
    interruptionNotice: string
    acknowledgeMain: string
    acknowledgeSub: string
    breathingGuide: string
    waitingCycleTexts: string[]
    completeMain: string
    completeSub: string
    completeContinue: string
    completeRestart: string
  }>({
    startTitle: TEXTS.start.titles[0],
    startSubtitle: TEXTS.start.subtitles[0],
    startDescription: TEXTS.start.descriptions[0],
    startButton: TEXTS.start.startButton[0],
    interruptionNotice: TEXTS.start.interruptionNotice[0],
    acknowledgeMain: TEXTS.acknowledge.mainTexts[0],
    acknowledgeSub: TEXTS.acknowledge.subTexts[0],
    breathingGuide: TEXTS.breathing.guideTexts[0],
    waitingCycleTexts: TEXTS.waiting.cycleTexts[0],
    completeMain: TEXTS.complete.mainMessages[0],
    completeSub: TEXTS.complete.subMessages[0],
    completeContinue: TEXTS.complete.continueButtons[0],
    completeRestart: TEXTS.complete.restartButtons[0],
  })

  const { initAudio, playAmbientSound, stopAudio } = useAudioGuide(audioEnabled)

  // 初始化时随机选择文案
  useEffect(() => {
    setSelectedTexts({
      startTitle: randomChoice(TEXTS.start.titles),
      startSubtitle: randomChoice(TEXTS.start.subtitles),
      startDescription: randomChoice(TEXTS.start.descriptions),
      startButton: randomChoice(TEXTS.start.startButton),
      interruptionNotice: randomChoice(TEXTS.start.interruptionNotice),
      acknowledgeMain: randomChoice(TEXTS.acknowledge.mainTexts),
      acknowledgeSub: randomChoice(TEXTS.acknowledge.subTexts),
      breathingGuide: randomChoice(TEXTS.breathing.guideTexts),
      waitingCycleTexts: randomChoice(TEXTS.waiting.cycleTexts),
      completeMain: randomChoice(TEXTS.complete.mainMessages),
      completeSub: randomChoice(TEXTS.complete.subMessages),
      completeContinue: randomChoice(TEXTS.complete.continueButtons),
      completeRestart: randomChoice(TEXTS.complete.restartButtons),
    })
  }, [])

  // 根据阶段获取背景色类名
  const getBackgroundClass = () => {
    switch (phase) {
      case 'start': return 'phase-start'
      case 'acknowledge': return 'phase-acknowledge'
      case 'breathing': return 'phase-breathing'
      case 'waiting': return 'phase-waiting'
      case 'complete': return 'phase-complete'
      default: return ''
    }
  }

  // 同步 phase 到 ref
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // 呼吸引导文案循环（10秒一个循环：4秒吸气，6秒呼气）
  useEffect(() => {
    if (phase !== 'breathing') {
      setBreathText('吸气')
      return
    }

    const breatheTextCycle = () => {
      setBreathText('吸气')
      setTimeout(() => {
        if (phaseRef.current === 'breathing') {
          setBreathText('呼气')
        }
      }, 4000)
    }

    breatheTextCycle()
    const interval = setInterval(breatheTextCycle, 10000)

    return () => clearInterval(interval)
  }, [phase])

  // 等待阶段的抚慰文案循环（每8秒换一句）
  useEffect(() => {
    if (phase !== 'waiting') {
      setWaitingText(selectedTexts.waitingCycleTexts[0])
      return
    }

    const comfortTexts = selectedTexts.waitingCycleTexts

    let index = 0
    setWaitingText(comfortTexts[0])

    const interval = setInterval(() => {
      if (phaseRef.current === 'waiting') {
        index = (index + 1) % comfortTexts.length
        setWaitingText(comfortTexts[index])
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [phase, selectedTexts.waitingCycleTexts])

  // 检测页面可见性（处理锁屏/切后台）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && phase !== 'start' && phase !== 'complete') {
        setInterruption(true)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [phase])

  // 开始90秒流程
  const startSession = useCallback(() => {
    if (interruption) {
      setInterruption(false)
    }

    // 随机选择本次会话的文案
    setSelectedTexts({
      startTitle: randomChoice(TEXTS.start.titles),
      startSubtitle: randomChoice(TEXTS.start.subtitles),
      startDescription: randomChoice(TEXTS.start.descriptions),
      startButton: randomChoice(TEXTS.start.startButton),
      interruptionNotice: randomChoice(TEXTS.start.interruptionNotice),
      acknowledgeMain: randomChoice(TEXTS.acknowledge.mainTexts),
      acknowledgeSub: randomChoice(TEXTS.acknowledge.subTexts),
      breathingGuide: randomChoice(TEXTS.breathing.guideTexts),
      waitingCycleTexts: randomChoice(TEXTS.waiting.cycleTexts),
      completeMain: randomChoice(TEXTS.complete.mainMessages),
      completeSub: randomChoice(TEXTS.complete.subMessages),
      completeContinue: randomChoice(TEXTS.complete.continueButtons),
      completeRestart: randomChoice(TEXTS.complete.restartButtons),
    })

    setPhase('acknowledge')
    setElapsedTime(0)
  }, [interruption])

  // 计时器逻辑 - 统一控制阶段切换
  useEffect(() => {
    if (phase === 'start' || phase === 'complete') {
      setElapsedTime(0)
      return
    }

    const timer = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1

        // 根据时间判断阶段
        if (newTime < 10 && phaseRef.current !== 'acknowledge') {
          setPhase('acknowledge')
        } else if (newTime >= 10 && newTime < 60 && phaseRef.current !== 'breathing') {
          setPhase('breathing')
        } else if (newTime >= 60 && newTime < 90 && phaseRef.current !== 'waiting') {
          setPhase('waiting')
        } else if (newTime >= 90 && phaseRef.current !== 'complete') {
          setPhase('complete')
          return 90 // 停止在90秒
        }

        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [phase])

  // 呼吸引导阶段播放音频
  useEffect(() => {
    if (phase === 'breathing') {
      playAmbientSound()
    }
  }, [phase, playAmbientSound])

  // 会话结束时停止音频
  useEffect(() => {
    if (phase === 'complete' || phase === 'start') {
      stopAudio()
    }
  }, [phase, stopAudio])

  // 重置会话
  const resetSession = useCallback(() => {
    setPhase('start')
    setElapsedTime(0)
  }, [])

  // 再来一轮
  const restartSession = useCallback(() => {
    setInterruption(false)
    startSession()
  }, [startSession])

  // 格式化时间显示 - 只显示秒数
  const formatTime = (seconds: number) => {
    return `${seconds}`
  }

  // 渲染启动页
  if (phase === 'start') {
    return (
      <div className={`app-container ${getBackgroundClass()}`}>
        {interruption && (
          <div className="interruption-notice">
            <p className="text-slate-300 text-lg px-8 text-center font-light">
              {selectedTexts.interruptionNotice}
            </p>
          </div>
        )}

        {/* 上方文字 */}
        <div className="start-header">
          <h1 className="start-title">{selectedTexts.startTitle}</h1>
          <p className="start-subtitle">{selectedTexts.startSubtitle}</p>
          <p className="start-description">
            {selectedTexts.startDescription}
          </p>
        </div>

        {/* 下方圆形按钮 */}
        <div className="start-actions">
          <button
            onClick={() => {
              initAudio()
              startSession()
            }}
            className="circle-button touch-friendly"
          >
            {selectedTexts.startButton}
          </button>
        </div>
      </div>
    )
  }

  // 渲染确认与允许阶段（0-10秒）
  if (phase === 'acknowledge') {
    return (
      <div className={`app-container ${getBackgroundClass()}`}>
        {/* 倒计时 */}
        <div className="countdown-display">{formatTime(elapsedTime)}</div>

        {/* 主文字居中 */}
        <div className="content flex flex-col items-center justify-center">
          <p className="phase-text text-center px-8">
            {selectedTexts.acknowledgeMain}
          </p>
        </div>

        {/* 副文字单独放在底部 */}
        <p className="acknowledge-subtext text-center px-8">
          {selectedTexts.acknowledgeSub}
        </p>
      </div>
    )
  }

  // 渲染呼吸引导阶段（10-60秒）
  if (phase === 'breathing') {
    return (
      <div className={`app-container ${getBackgroundClass()}`}>
        {/* 倒计时 */}
        <div className="countdown-display">{formatTime(elapsedTime)}</div>

        <div className="content">
          {/* 呼吸圆圈动画 */}
          <div className="breath-container">
            <div className="breath-wrapper">
              <div className="breath-circle breath-animated" />
              <div className="breath-circle breath-animated-middle" />
              <div className="breath-circle breath-animated-outer" />
            </div>
          </div>

          {/* 呼吸提示 - 动态文案 */}
          <p className="breath-action-text no-select">
            {breathText}
          </p>
          <p className="breath-guide-text no-select">
            {selectedTexts.breathingGuide}
          </p>
        </div>
      </div>
    )
  }

  // 渲染等待情绪回落阶段（60-90秒）
  if (phase === 'waiting') {
    return (
      <div className={`app-container ${getBackgroundClass()}`}>
        {/* 倒计时 */}
        <div className="countdown-display">{formatTime(elapsedTime)}</div>

        <div className="content">
          {/* 缓慢消散的动画 */}
          <div className="breath-container">
            <div
              className="breath-circle"
              style={{
                width: '250px',
                height: '250px',
                animation: 'fadeSlow 30s ease-out forwards, pulseSlow 3s ease-in-out infinite',
              }}
            />
          </div>

          <p
            key={waitingText}
            className="phase-text text-center px-8 mt-16 no-select animate-fade-in"
          >
            {waitingText}
          </p>
        </div>
      </div>
    )
  }

  // 渲染完成阶段（90秒后）
  if (phase === 'complete') {
    return (
      <div className={`app-container ${getBackgroundClass()}`}>
        {/* 上方文字 */}
        <div className="complete-header">
          <h1 className="complete-title">{selectedTexts.completeMain}</h1>
          <p className="complete-subtitle">{selectedTexts.completeSub}</p>
        </div>

        {/* 下方圆形按钮 */}
        <div className="complete-actions">
          <button
            onClick={restartSession}
            className="complete-circle-button touch-friendly"
          >
            {selectedTexts.completeRestart}
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default App
