import { useEffect, useRef, useState } from 'react'

export function useAudioGuide(enabled: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // 初始化音频上下文（需要用户交互）
  const initAudio = () => {
    if (!enabled || isInitialized) return

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContext()
      setIsInitialized(true)
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  // 播放背景白噪音（柔和的环境音）
  const playAmbientSound = () => {
    if (!enabled || !audioContextRef.current || !isInitialized) return

    try {
      const ctx = audioContextRef.current

      // 创建多个振荡器来模拟柔和的噪音
      const oscillator1 = ctx.createOscillator()
      const oscillator2 = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator1.type = 'sine'
      oscillator1.frequency.setValueAtTime(80, ctx.currentTime)

      oscillator2.type = 'sine'
      oscillator2.frequency.setValueAtTime(120, ctx.currentTime)

      // 非常低的音量
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 1)

      oscillator1.connect(gainNode)
      oscillator2.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator1.start()
      oscillator2.start()

      oscillatorRef.current = oscillator1
      gainNodeRef.current = gainNode
    } catch (error) {
      console.warn('Error playing ambient sound:', error)
    }
  }

  // 停止音频
  const stopAudio = () => {
    if (oscillatorRef.current && gainNodeRef.current) {
      try {
        gainNodeRef.current.gain.linearRampToValueAtTime(
          0,
          audioContextRef.current!.currentTime + 1
        )
        setTimeout(() => {
          if (oscillatorRef.current) {
            oscillatorRef.current.stop()
            oscillatorRef.current = null
          }
        }, 1000)
      } catch (error) {
        console.warn('Error stopping audio:', error)
      }
    }
  }

  // 清理
  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop()
        } catch (error) {
          // Ignore
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  return {
    initAudio,
    playAmbientSound,
    stopAudio,
    isInitialized
  }
}
