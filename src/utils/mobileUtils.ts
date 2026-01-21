// 移动端工具函数

/**
 * 检测是否为iOS设备
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

/**
 * 检测是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 防止iOS自动锁定（通过播放静音音频）
 * 注意：这只能延缓锁定，不能完全阻止
 */
export function preventIOSLock() {
  if (!isIOS()) return

  let audioContext: AudioContext | null = null

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    audioContext = new AudioContextClass()

    // 每30秒播放一次非常短的静音
    setInterval(() => {
      if (audioContext && audioContext.state === 'running') {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        oscillator.start(0)
        oscillator.stop(0.01)
      }
    }, 30000)
  } catch (error) {
    console.warn('无法启用iOS防锁定功能:', error)
  }
}

/**
 * 获取安全区域 insets
 */
export function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement)

  return {
    top: parseInt(style.getPropertyValue('safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('safe-area-inset-left') || '0'),
  }
}

/**
 * 启用震动反馈（如果设备支持）
 */
export function vibrate(duration: number = 10) {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration)
  }
}
