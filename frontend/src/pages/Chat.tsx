import { useEffect, useRef, useState } from 'react'
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel,
  TextField, IconButton, Paper, CircularProgress, Avatar, Chip, Card, CardContent,
} from '@mui/material'
import { Send, AutoAwesome, Person, Psychology, Terminal, DataObject, Storage } from '@mui/icons-material'
import api from '../api'

interface DataSource { id: number; name: string; status: string }
interface Message { role: 'user' | 'assistant'; content: string; type?: 'thinking' | 'sql' | 'result' | 'answer' }

// 简单的 Markdown 代码块渲染
function renderContent(content: string) {
  const parts = content.split(/(```sql[\s\S]*?```)/g)
  return parts.map((part, idx) => {
    if (part.startsWith('```sql')) {
      const code = part.replace(/```sql\n?/, '').replace(/```\n?$/, '')
      return (
        <Box key={idx} sx={{
          bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, borderRadius: 1,
          fontFamily: '"Fira Code", monospace', fontSize: 12, my: 1, overflow: 'auto',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, color: '#569cd6' }}>
            <Terminal sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: 11, color: '#808080' }}>SQL</Typography>
          </Box>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{code}</pre>
        </Box>
      )
    }
    return <Typography key={idx} component="span">{part}</Typography>
  })
}

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

    // 添加思考状态
    setMessages((prev) => [...prev, { role: 'assistant', content: '', type: 'thinking' }])

    const token = localStorage.getItem('token')
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ datasource_id: selectedId, message: userMsg }),
    })

    if (!response.ok) {
      setStreaming(false)
      setMessages((prev) => {
        prev[prev.length - 1] = { role: 'assistant', content: '请求失败，请检查后端服务', type: 'result' }
        return prev
      })
      return
    }

    // 移除思考状态，准备接收实际内容
    let currentContent = ''
    let currentType: 'thinking' | 'sql' | 'result' | 'answer' = 'thinking'

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
          currentContent += text
          setMessages((prev) => {
            const updated = [...prev]
            // 检测内容类型
            if (text.includes('```sql')) {
              currentType = 'sql'
            } else if (text.includes('执行错误')) {
              currentType = 'result'
            } else if (currentType === 'thinking' && text.length > 20) {
              currentType = 'answer'
            }
            updated[updated.length - 1] = { role: 'assistant', content: currentContent, type: currentType }
            return updated
          })
        } catch (e) {
          console.error('解析失败:', e)
        }
      }
    }
    setStreaming(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)', maxWidth: 960, mx: 'auto', width: '100%' }}>
      {/* 数据源选择 */}
      <Card sx={{
        mb: 3,
        borderRadius: 3,
        border: '1px solid #f1f3f4',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
        bgcolor: 'white',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.03)',
        },
      }}>
        <CardContent sx={{
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            bgcolor: 'rgba(26,115,232,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Storage sx={{ fontSize: 20, color: '#1a73e8' }} />
          </Box>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel sx={{ fontSize: 14.5, color: '#6b7280' }}>数据源</InputLabel>
            <Select
              value={selectedId}
              label="数据源"
              onChange={(e) => setSelectedId(e.target.value as number)}
              sx={{
                fontSize: 14.5,
                fontWeight: 500,
                borderRadius: 2.5,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb', borderWidth: 1.5 },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9ca3af' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1a73e8', borderWidth: 2 },
              }}
            >
              {sources.map((s) => (
                <MenuItem key={s.id} value={s.id} sx={{ fontSize: 14.5, borderRadius: 2, mx: 1 }}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {sources.length === 0 && (
            <Typography variant="caption" color="#6b7280" sx={{ fontSize: 13.5, fontWeight: 500 }}>
              暂无就绪的数据源，请先在「数据源」页面配置
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 消息列表 */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        mb: 2,
        px: 1,
      }}>
        {messages.length === 0 && (
          <Card sx={{
            borderRadius: 4,
            border: '1px solid #f1f3f4',
            textAlign: 'center',
            py: 10,
            px: 4,
            bgcolor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
            mx: 'auto',
            maxWidth: 520,
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 4px 12px rgba(26,115,232,0.15)',
            }}>
              <AutoAwesome sx={{ fontSize: 40, color: '#1a73e8' }} />
            </Box>
            <Typography variant="h6" color="#1f1f1f" fontWeight={600} gutterBottom sx={{ fontSize: 20, letterSpacing: '-0.3px' }}>
              开始你的数据分析之旅
            </Typography>
            <Typography variant="body2" color="#6b7280" sx={{ fontSize: 14.5, mb: 3.5, maxWidth: 380, mx: 'auto', lineHeight: 1.6 }}>
              选择一个数据源，然后提出你想了解的问题
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['最近一个月的销售趋势？', '哪些商品销量最高？', '用户留存率如何？'].map((q) => (
                <Chip
                  key={q}
                  label={q}
                  size="small"
                  onClick={() => setInput(q)}
                  sx={{
                    cursor: 'pointer',
                    fontSize: 13.5,
                    fontWeight: 500,
                    height: 36,
                    borderRadius: 3,
                    px: 2,
                    bgcolor: '#f9fafb',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: '#eff6ff',
                      borderColor: '#1a73e8',
                      color: '#1a73e8',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(26,115,232,0.15)',
                    },
                  }}
                />
              ))}
            </Box>
          </Card>
        )}

        {messages.map((msg, i) => (
          <Box
            key={i}
            display="flex"
            justifyContent={msg.role === 'user' ? 'flex-end' : 'flex-start'}
            gap={2}
            alignItems="flex-start"
          >
            {msg.role === 'assistant' && (
              <Avatar
                sx={{
                  bgcolor: msg.type === 'thinking' ? '#fef3c7' : msg.type === 'sql' ? '#dbeafe' : msg.type === 'result' ? '#dcfce7' : '#dbeafe',
                  width: 38,
                  height: 38,
                  mt: 0.25,
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  border: '2px solid white',
                }}
              >
                {msg.type === 'thinking' ? (
                  <Psychology sx={{ fontSize: 20, color: '#d97706' }} />
                ) : msg.type === 'sql' ? (
                  <Terminal sx={{ fontSize: 20, color: '#1a73e8' }} />
                ) : msg.type === 'result' ? (
                  <DataObject sx={{ fontSize: 20, color: '#15803d' }} />
                ) : (
                  <AutoAwesome sx={{ fontSize: 20, color: '#1a73e8' }} />
                )}
              </Avatar>
            )}
            <Paper
              elevation={0}
              sx={{
                maxWidth: '75%',
                px: 3,
                py: 2,
                borderRadius: msg.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                bgcolor: msg.role === 'user' ? '#1a73e8' : 'white',
                color: msg.role === 'user' ? 'white' : '#1f1f1f',
                border: msg.role === 'assistant' ? '1px solid #f1f3f4' : 'none',
                boxShadow: msg.role === 'user' ? '0 2px 8px rgba(26,115,232,0.2)' : '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.03)',
                whiteSpace: 'pre-wrap',
                fontSize: 14.5,
                lineHeight: 1.7,
              }}
            >
              {msg.type === 'thinking' && !msg.content ? (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', py: 0.5 }}>
                  <Psychology sx={{ fontSize: 17, mr: 0.5, color: '#d97706', animation: 'pulse 1s ease-in-out infinite' }} />
                  <Typography sx={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>正在分析...</Typography>
                </Box>
              ) : msg.role === 'user' ? (
                <Typography sx={{ fontSize: 15, fontWeight: 400 }}>{msg.content}</Typography>
              ) : (
                renderContent(msg.content)
              )}
            </Paper>
            {msg.role === 'user' && (
              <Avatar
                sx={{
                  bgcolor: '#f3f4f6',
                  width: 38,
                  height: 38,
                  mt: 0.25,
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  border: '2px solid white',
                }}
              >
                <Person sx={{ fontSize: 22, color: '#6b7280' }} />
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
          display: 'flex',
          alignItems: 'center',
          px: 2.5,
          py: 1.5,
          borderRadius: 4,
          border: '2px solid',
          borderColor: '#e5e7eb',
          bgcolor: 'white',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:focus-within': {
            borderColor: '#1a73e8',
            boxShadow: '0 0 0 6px rgba(26,115,232,0.08), 0 4px 16px rgba(26,115,232,0.12)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <TextField
          fullWidth
          variant="standard"
          placeholder="输入问题，按 Enter 发送..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
          disabled={!selectedId || streaming}
          InputProps={{
            disableUnderline: true,
            sx: { fontSize: 15, py: 1, px: 1 },
          }}
          sx={{
            '& .MuiInputBase-input:disabled': { color: '#9ca3af' },
          }}
        />
        <IconButton
          color="primary"
          onClick={send}
          disabled={!selectedId || streaming || !input.trim()}
          sx={{
            ml: 1.5,
            width: 44,
            height: 44,
            bgcolor: input.trim() && selectedId ? '#1a73e8' : '#f3f4f6',
            color: input.trim() && selectedId ? 'white' : '#9ca3af',
            '&:hover': {
              bgcolor: input.trim() && selectedId ? '#1557b0' : '#e5e7eb',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '& .MuiSvgIcon-root': { fontSize: 20 },
            '&.Mui-disabled': {
              bgcolor: '#f3f4f6',
              color: '#9ca3af',
            },
          }}
        >
          {streaming ? <CircularProgress size={22} color="inherit" sx={{ color: 'white' }} /> : <Send />}
        </IconButton>
      </Paper>
    </Box>
  )
}
