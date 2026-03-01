import { useCallback, useRef, useState } from 'react'
import { MdUpload, MdInsertDriveFile } from 'react-icons/md'

interface FileDropZoneProps {
  onFileSelect: (file: File) => void
  isLoading?: boolean
}

export function FileDropZone({ onFileSelect, isLoading }: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (file.name.match(/\.(midi?|mid)$/i)) {
          onFileSelect(file)
        }
      }
    },
    [onFileSelect],
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onFileSelect(file)
      }
      // 重置 input 以便可以再次选择同一文件
      e.target.value = ''
    },
    [onFileSelect],
  )

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex flex-col items-center justify-center gap-4
        p-8 rounded-2xl border-2 border-dashed
        transition-all duration-200 cursor-pointer
        min-w-[300px] min-h-[160px]
        ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/20'
            : 'border-slate-600 bg-slate-800/50 hover:border-slate-400 hover:bg-slate-800'
        }
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mid,.midi,.MID,.MIDI"
        onChange={handleFileChange}
        className="hidden"
      />

      {isLoading ? (
        <>
          <div className="w-12 h-12 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
          <span className="text-slate-400 text-sm">Parsing MIDI file...</span>
        </>
      ) : (
        <>
          <div className="relative">
            <MdUpload className="w-12 h-12 text-slate-400" />
            <MdInsertDriveFile className="w-5 h-5 text-cyan-400 absolute -bottom-1 -right-1" />
          </div>
          <div className="text-center">
            <p className="text-slate-200 font-medium">Drag a MIDI file here</p>
            <p className="text-slate-500 text-sm mt-1">or click to choose one</p>
            <p className="text-slate-600 text-xs mt-2">Supports .mid and .midi</p>
          </div>
        </>
      )}
    </div>
  )
}
