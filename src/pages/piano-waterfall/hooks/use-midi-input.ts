import { useEffect, useRef, useCallback, useState } from 'react'
import { useWaterfallStore } from './use-waterfall-store'

export interface UseMidiInputReturn {
  isSupported: boolean
  isListening: boolean
  error: string | null
  startListening: () => Promise<void>
  stopListening: () => void
}

export function useMidiInput(): UseMidiInputReturn {
  const isListeningRef = useRef(false)
  const accessRef = useRef<MIDIAccess | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { addActiveKey, removeActiveKey } = useWaterfallStore()

  // 处理 MIDI 消息
  const handleMidiMessage = useCallback(
    (event: MIDIMessageEvent) => {
      const data = event.data
      if (!data || data.length < 3) return

      const [status, note, velocity] = data
      const messageType = status & 0xf0

      // Note On (0x90) with velocity > 0
      if (messageType === 0x90 && velocity > 0) {
        addActiveKey({
          midi: note,
          velocity: velocity / 127,
          source: 'input',
          color: '#06FFA5', // 青色 - 区分实时输入
        })
      }
      // Note Off (0x80) or Note On with velocity 0
      else if (
        messageType === 0x80 ||
        (messageType === 0x90 && velocity === 0)
      ) {
        removeActiveKey(note, 'input')
      }
    },
    [addActiveKey, removeActiveKey],
  )

  // 设置输入监听
  const setupInputs = useCallback(
    (access: MIDIAccess) => {
      const inputs = access.inputs.values()
      for (const input of inputs) {
        input.addEventListener('midimessage', handleMidiMessage)
      }
    },
    [handleMidiMessage],
  )

  // 清理输入监听
  const cleanupInputs = useCallback(
    (access: MIDIAccess) => {
      const inputs = access.inputs.values()
      for (const input of inputs) {
        input.removeEventListener('midimessage', handleMidiMessage)
      }
    },
    [handleMidiMessage],
  )

  // 开始监听
  const startListening = useCallback(async () => {
    if (isListeningRef.current) return

    try {
      setError(null)

      if (!navigator.requestMIDIAccess) {
        setIsSupported(false)
        setError('Web MIDI API is not supported in this browser')
        return
      }

      const access = await navigator.requestMIDIAccess({ sysex: false })
      accessRef.current = access

      // 监听设备连接/断开
      access.addEventListener('statechange', (e) => {
        const port = e.port
        if (!port || port.type !== 'input') return

        if (port.state === 'connected') {
          port.addEventListener('midimessage', handleMidiMessage as EventListener)
        } else {
          port.removeEventListener('midimessage', handleMidiMessage as EventListener)
        }
      })

      setupInputs(access)
      isListeningRef.current = true
      setIsListening(true)
    } catch (err) {
      console.error('Failed to start MIDI input:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to start MIDI input',
      )
    }
  }, [setupInputs, handleMidiMessage])

  // 停止监听
  const stopListening = useCallback(() => {
    if (!isListeningRef.current) return

    if (accessRef.current) {
      cleanupInputs(accessRef.current)
      accessRef.current = null
    }

    isListeningRef.current = false
    setIsListening(false)
  }, [cleanupInputs])

  // 清理
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  return {
    isSupported,
    isListening,
    error,
    startListening,
    stopListening,
  }
}
