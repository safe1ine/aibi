import { useEffect, useRef, useState } from 'react'
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel,
  TextField, IconButton, Paper, CircularProgress, Avatar, Chip,
} from '@mui/material'
import { Send, AutoAwesome, Person } from '@mui/icons-material'
import api from '../api'

interface DataSource { id: number; name: string; status: string }
interface Message { role: 'user' | 'assistant'; content: string }

export default function Chat() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get('/datasources').then(({ data }) => {
      const ready = data.filter((d: DataSource) => d.status === 'ready')
      setSources(ready)
      if (ready.length > 0) setSelectedId(ready[0].id)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || !selectedId || streaming) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setStreaming(true)

    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:8100/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ datasource_id: selectedId, message: userMsg }),
    })

    if (!response.ok) { setStreaming(false); return }

    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      for (const line of decoder.decode(value).split('\n')) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') break
        try {
          const { text } = JSON.parse(data)
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: updated[updated.length - 1].content + text }
            return updated
          })
        } catch {}
      }
    }
    setStreaming(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: 860, mx: 'auto', px: 3, py: 2.5 }}>
      {/* 数据源选择 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>数据源</InputLabel>
          <Select value={selectedId} label="数据源" onChange={(e) => setSelectedId(e.target.value as number)}>
            {sources.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </Select>
        </FormControl>
        {sources.length === 0 && (
          <Typography variant="caption" color="text.secondary">暂无就绪的数据源，请先在「数据源」页面配置</Typography>
        )}
      </Box>

      {/* 消息列表 */}
      <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5, mb: 2 }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 8, color: 'text.disabled' }}>
            <AutoAwesome sx={{ fontSize: 40, mb: 1.5, color: 'primary.light', opacity: 0.5 }} />
            <Typography variant="body2" color="text.secondary">选择数据源后直接提问</Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
              {['最近一个月的销售趋势？', '哪些商品销量最高？', '用户留存率如何？'].map((q) => (
                <Chip
                  key={q} label={q} size="small" variant="outlined"
                  onClick={() => setInput(q)}
                  sx={{ cursor: 'pointer', fontSize: 12, '&:hover': { bgcolor: 'primary.50', borderColor: 'primary.main' } }}
                />
              ))}
            </Box>
          </Box>
        )}

        {messages.map((msg, i) => (
          <Box key={i} display="flex" justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'} gap={1.5} alignItems="flex-start">
            {msg.role === 'assistant' && (
              <Avatar sx={{ bgcolor: 'primary.main', width: 30, height: 30, mt: 0.3, flexShrink: 0 }}>
                <AutoAwesome sx={{ fontSize: 15 }} />
              </Avatar>
            )}
            <Paper
              elevation={0}
              sx={{
                maxWidth: '78%',
                px: 2, py: 1.5,
                borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                bgcolor: msg.role === 'user' ? 'primary.main' : 'white',
                color: msg.role === 'user' ? 'white' : 'text.primary',
                border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                whiteSpace: 'pre-wrap',
                fontSize: 14,
                lineHeight: 1.7,
                fontFamily: msg.content.includes('```') ? '"Fira Code", monospace' : 'inherit',
              }}
            >
              {msg.content || (streaming && i === messages.length - 1
                ? <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', py: 0.3 }}>
                    {[0, 1, 2].map((j) => (
                      <Box key={j} sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.light',
                        animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${j * 0.2}s`,
                        '@keyframes pulse': { '0%,100%': { opacity: 0.3 }, '50%': { opacity: 1 } }
                      }} />
                    ))}
                  </Box>
                : ''
              )}
            </Paper>
            {msg.role === 'user' && (
              <Avatar sx={{ bgcolor: '#e2e8f0', width: 30, height: 30, mt: 0.3, flexShrink: 0 }}>
                <Person sx={{ fontSize: 16, color: '#64748b' }} />
              </Avatar>
            )}
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* 输入框 */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex', alignItems: 'center', px: 2, py: 0.5,
          borderRadius: 3,
          border: '1.5px solid',
          borderColor: 'divider',
          bgcolor: 'white',
          transition: 'border-color 0.2s',
          '&:focus-within': { borderColor: 'primary.main', boxShadow: '0 0 0 3px rgba(30,64,175,0.08)' },
        }}
      >
        <TextField
          fullWidth variant="standard"
          placeholder="输入问题，按 Enter 发送..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          disabled={!selectedId || streaming}
          InputProps={{ disableUnderline: true, sx: { fontSize: 14, py: 0.5 } }}
        />
        <IconButton
          color="primary" onClick={send}
          disabled={!selectedId || streaming || !input.trim()}
          sx={{ ml: 0.5, width: 36, height: 36, bgcolor: input.trim() && selectedId ? 'primary.main' : 'transparent',
            color: input.trim() && selectedId ? 'white' : 'text.disabled',
            '&:hover': { bgcolor: 'primary.dark' },
            transition: 'all 0.2s',
          }}
        >
          {streaming ? <CircularProgress size={16} color="inherit" /> : <Send sx={{ fontSize: 17 }} />}
        </IconButton>
      </Paper>
    </Box>
  )
}
