import { useEffect, useRef, useState } from 'react'
import {
  Box, Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tooltip, Alert, CircularProgress, Stack, Divider,
  Accordion, AccordionSummary, AccordionDetails, Paper, Card, CardContent,
} from '@mui/material'
import {
  Add, Refresh, Delete, CloudUpload, Storage, InsertDriveFile,
  ExpandMore, Description, Analytics, TextSnippet,
} from '@mui/icons-material'
import api from '../api'

interface DataSource {
  id: number; name: string; type?: string
  description: string; schema_doc: string | null; connection_info: string | null
  status: 'pending' | 'analyzing' | 'ready' | 'error'; error_message: string | null
}

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'default', analyzing: 'warning', ready: 'success', error: 'error',
}
const statusLabel: Record<string, string> = {
  pending: '待分析', analyzing: '分析中', ready: '就绪', error: '错误',
}

export default function DataSources() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [analyzingDs, setAnalyzingDs] = useState<{id: number; name: string} | null>(null)
  const [analyzeLogs, setAnalyzeLogs] = useState<string[]>([])
  const [expandedDs, setExpandedDs] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const fetchSources = async () => {
    const { data } = await api.get('/datasources')
    setSources(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchSources()
    timerRef.current = setInterval(fetchSources, 3000)
    return () => clearInterval(timerRef.current)
  }, [])

  const resetForm = () => { setName(''); setDescription(''); setFiles([]) }

  const startStreamAnalyze = async (dsId: number, dsName: string) => {
    setAnalyzingDs({ id: dsId, name: dsName })
    setAnalyzeLogs([])
    setExpandedDs(dsId)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/datasources/${dsId}/analyze-stream`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error('分析失败')

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
            const { type, text } = JSON.parse(data)
            if (type === 'log') {
              setAnalyzeLogs(prev => [...prev, text])
            } else if (type === 'thinking') {
              setAnalyzeLogs(prev => {
                const updated = [...prev]
                const lastIdx = updated.length - 1
                if (lastIdx >= 0 && updated[lastIdx].includes?.('💭')) {
                  updated[lastIdx] = text
                } else {
                  updated.push(`💭 ${text}`)
                }
                return updated
              })
            } else if (type === 'done') {
              setAnalyzeLogs(prev => [...prev, '\n✅ 分析完成！'])
              fetchSources()
            } else if (type === 'error') {
              setAnalyzeLogs(prev => [...prev, `❌ ${text}`])
            }
          } catch (e) {
            console.error('解析失败:', e)
          }
        }
      }
    } catch (e: any) {
      setAnalyzeLogs(prev => [...prev, `❌ 错误：${e.message}`])
    } finally {
      setTimeout(() => setAnalyzingDs(null), 2000)
    }
  }

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('name', name)
      fd.append('description', description)
      files.forEach((f) => fd.append('files', f))

      const { data } = await api.post('/datasources', fd)
      setOpen(false); resetForm()
      if (data.id) startStreamAnalyze(data.id, data.name)
    } catch (e: any) {
      alert(e.response?.data?.detail || '创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  const parseConnectionInfo = (ds: DataSource) => {
    if (!ds.connection_info) return null
    try {
      return JSON.parse(ds.connection_info)
    } catch {
      return null
    }
  }

  const detectSourceType = (ds: DataSource): 'database' | 'file' | 'text' => {
    const connInfo = parseConnectionInfo(ds)
    if (connInfo?.files) return 'file'
    if (connInfo?.type && ['mysql', 'postgresql', 'sqlite'].includes(connInfo.type)) return 'database'
    return 'text'
  }

  return (
    <>
      {/* 顶部标题区 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={600} sx={{ fontSize: 24, color: '#1f1f1f', mb: 0.5, letterSpacing: '-0.3px' }}>
            数据源管理
          </Typography>
          <Typography variant="body2" color="#6b7280" sx={{ fontSize: 14.5, lineHeight: 1.5 }}>
            添加数据源，AI 将自动识别类型并分析数据结构
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpen(true)}
          size="medium"
          sx={{
            bgcolor: '#1a73e8',
            color: 'white',
            fontWeight: 600,
            fontSize: 14.5,
            px: 2.5,
            py: 1.5,
            borderRadius: 3,
            boxShadow: '0 2px 8px rgba(26,115,232,0.25), 0 1px 3px rgba(0,0,0,0.08)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: '#1557b0',
              boxShadow: '0 4px 16px rgba(26,115,232,0.3), 0 2px 6px rgba(0,0,0,0.12)',
              transform: 'translateY(-1px)',
            },
            '& .MuiButton-startIcon': { mr: 1 },
          }}
        >
          添加数据源
        </Button>
      </Box>

      {/* 数据源列表 */}
      {loading ? (
        <Box display="flex" justifyContent="center" pt={10}>
          <CircularProgress size={36} sx={{ color: '#1a73e8' }} />
        </Box>
      ) : sources.length === 0 ? (
        <Card sx={{
          borderRadius: 4,
          border: '1px solid #f1f3f4',
          textAlign: 'center',
          py: 12,
          px: 4,
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
        }}>
          <Box sx={{
            width: 80,
            height: 80,
            borderRadius: '20px',
            bgcolor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
          }}>
            <Storage sx={{ fontSize: 40, color: '#9ca3af' }} />
          </Box>
          <Typography variant="h6" color="#1f1f1f" fontWeight={600} gutterBottom sx={{ fontSize: 20, letterSpacing: '-0.3px' }}>
            还没有数据源
          </Typography>
          <Typography variant="body2" color="#6b7280" sx={{ fontSize: 14.5, mb: 3, lineHeight: 1.5 }}>
            点击右上角按钮添加数据源
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {sources.map((ds) => {
            const connInfo = parseConnectionInfo(ds)
            const sourceType = detectSourceType(ds)
            const isExpanded = expandedDs === ds.id || analyzingDs?.id === ds.id
            const isAnalyzingThis = analyzingDs?.id === ds.id

            return (
              <Accordion
                key={ds.id}
                expanded={isExpanded}
                onChange={(_, isExpanded) => setExpandedDs(isExpanded ? ds.id : null)}
                disabled={ds.status === 'pending' || ds.status === 'analyzing'}
                sx={{
                  borderRadius: 3,
                  border: '1px solid #f1f3f4',
                  '&:before': { display: 'none' },
                  boxShadow: isExpanded ? '0 8px 24px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)' : '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
                  bgcolor: 'white',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&.Mui-expanded': {
                    borderLeft: '4px solid #1a73e8',
                    boxShadow: '0 8px 32px rgba(26,115,232,0.12), 0 4px 16px rgba(26,115,232,0.06)',
                    transform: 'translateY(-1px)',
                  },
                  '&.Mui-disabled': { opacity: 0.6 },
                }}
              >
                {/* 手风琴头部 - 数据源概要 */}
                <AccordionSummary
                  expandIcon={ds.status !== 'ready' ? null : <ExpandMore />}
                  sx={{
                    bgcolor: 'white',
                    borderRadius: isExpanded ? '3px 3px 0 0' : 3,
                    minHeight: 72,
                    px: 3,
                    '& .MuiAccordionSummary-expandIconWrapper': {
                      color: '#6b7280',
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2.5} flexWrap="wrap" width="100%">
                    <Box sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: sourceType === 'database' ? '#dbeafe' : sourceType === 'file' ? '#fce7f3' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: sourceType === 'database' ? 'inset 0 2px 4px rgba(26,115,232,0.1)' : sourceType === 'file' ? 'inset 0 2px 4px rgba(219,39,119,0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.06)',
                    }}>
                      {sourceType === 'database'
                        ? <Storage sx={{ fontSize: 26, color: '#1a73e8' }} />
                        : sourceType === 'file'
                        ? <InsertDriveFile sx={{ fontSize: 26, color: '#db2777' }} />
                        : <TextSnippet sx={{ fontSize: 26, color: '#6b7280' }} />}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography fontWeight={600} fontSize={15.5} color="#1f1f1f" sx={{ letterSpacing: '-0.2px' }}>{ds.name}</Typography>
                      <Box display="flex" alignItems="center" gap={2} mt={1} flexWrap="wrap">
                        <Chip
                          label={statusLabel[ds.status]}
                          size="small"
                          sx={{
                            height: 26,
                            fontSize: 12.5,
                            fontWeight: 600,
                            bgcolor: ds.status === 'ready' ? '#dcfce7' : ds.status === 'analyzing' ? '#fef3c7' : ds.status === 'error' ? '#fee2e2' : '#f3f4f6',
                            color: ds.status === 'ready' ? '#15803d' : ds.status === 'analyzing' ? '#d97706' : ds.status === 'error' ? '#dc2626' : '#6b7280',
                            border: 'none',
                            boxShadow: ds.status === 'ready' ? '0 1px 3px rgba(21,128,61,0.15)' : 'none',
                          }}
                        />
                        {ds.status === 'ready' && (
                          <Chip
                            icon={
                              sourceType === 'database' ? <Storage sx={{ fontSize: 14 }} /> :
                              sourceType === 'file' ? <InsertDriveFile sx={{ fontSize: 14 }} /> :
                              <TextSnippet sx={{ fontSize: 14 }} />
                            }
                            label={sourceType === 'database' ? '数据库' : sourceType === 'file' ? '文件' : '纯文本'}
                            size="small"
                            sx={{
                              height: 26,
                              fontSize: 12.5,
                              fontWeight: 600,
                              bgcolor: sourceType === 'database' ? '#dbeafe' : sourceType === 'file' ? '#fce7f3' : '#f9fafb',
                              color: sourceType === 'database' ? '#1a73e8' : sourceType === 'file' ? '#db2777' : '#6b7280',
                              border: 'none',
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Typography variant="body2" color="#6b7280" sx={{ flex: 1, minWidth: 250, fontSize: 14, lineHeight: 1.5 }}>
                      {ds.description || '无描述'}
                    </Typography>

                    <Box display="flex" gap={0.5}>
                      <Tooltip title={ds.status === 'analyzing' ? '分析中...' : '重新分析'}>
                        <IconButton
                          size="medium"
                          onClick={(e) => {
                            e.stopPropagation()
                            startStreamAnalyze(ds.id, ds.name)
                          }}
                          disabled={ds.status === 'analyzing'}
                          sx={{
                            color: '#6b7280',
                            '&:hover': { bgcolor: 'rgba(26,115,232,0.04)', color: '#1a73e8' },
                            '&.Mui-disabled': { color: '#d1d5db' },
                          }}
                        >
                          <Refresh sx={{ fontSize: 22, ...(ds.status === 'analyzing' ? { animation: 'spin 1s linear infinite' } : {}) }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="删除">
                        <IconButton
                          size="medium"
                          color="error"
                          onClick={async (e) => {
                            e.stopPropagation()
                            if (confirm('确定要删除这个数据源吗？')) {
                              await api.delete(`/datasources/${ds.id}`)
                              fetchSources()
                            }
                          }}
                          sx={{
                            '&:hover': { bgcolor: '#fef2f2', color: '#dc2626' },
                          }}
                        >
                          <Delete sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </AccordionSummary>

                {/* 展开的详情内容 */}
                <AccordionDetails sx={{ p: 0 }}>
                  <Box sx={{ borderTop: '1px solid #f3f4f6' }}>
                    {/* AI 分析过程区块（仅在分析时显示） */}
                    {isAnalyzingThis && (
                      <Box sx={{
                        bgcolor: '#1e1e1e',
                        p: 3,
                        borderBottom: '1px solid #374151',
                      }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2.5}>
                          <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            bgcolor: 'rgba(96,165,250,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Analytics sx={{ fontSize: 20, color: '#60a5fa' }} />
                          </Box>
                          <Typography sx={{ color: '#e5e7eb', fontWeight: 600, fontSize: 14.5 }}>
                            AI 分析过程 - {ds.name}
                          </Typography>
                          <CircularProgress size={18} sx={{ color: '#6b7280' }} />
                        </Box>
                        <Box sx={{
                          bgcolor: '#0d0d0d',
                          borderRadius: 2.5,
                          p: 3,
                          maxHeight: 320,
                          overflow: 'auto',
                          fontFamily: 'Consolas, Monaco, monospace',
                          fontSize: 12.5,
                          border: '1px solid #374151',
                          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)',
                        }}>
                          {analyzeLogs.length === 0 ? (
                            <Typography sx={{ color: '#6b7280' }}>🔄 准备开始分析...</Typography>
                          ) : (
                            analyzeLogs.map((log, i) => (
                              <Box key={i} sx={{
                                py: 0.5,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: log.includes('✅') ? '#34d399' : log.includes('❌') ? '#f87171' : log.includes('💭') ? '#fbbf24' : '#93c5fd',
                                fontFamily: 'Consolas, Monaco, monospace',
                                fontSize: 13,
                              }}>
                                {log}
                              </Box>
                            ))
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* 左右分栏：左边原始内容，右边 AI 分析结果 */}
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }}>
                      {/* 左侧：原始信息 */}
                      <Box
                        sx={{
                          flex: 1,
                          p: 3,
                          borderRight: { md: '1px solid #e5e7eb' },
                          borderBottom: { md: 'none', xs: '1px solid #e5e7eb' },
                          minWidth: 0,
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            bgcolor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                          }}>
                            <TextSnippet sx={{ fontSize: 20, color: '#6b7280' }} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={600} color="#1f1f1f" sx={{ fontSize: 15.5, letterSpacing: '-0.2px' }}>
                            原始信息
                          </Typography>
                        </Box>

                        <Stack spacing={3}>
                          {/* 描述信息 */}
                          <Paper variant="outlined" sx={{
                            p: 3,
                            borderRadius: 2.5,
                            bgcolor: '#f9fafb',
                            borderColor: '#e5e7eb',
                          }}>
                            <Typography variant="caption" color="#6b7280" fontWeight={600} display="block" mb={2} fontSize={12.5}>
                              文字描述
                            </Typography>
                            <Typography variant="body2" sx={{ fontSize: 14.5, whiteSpace: 'pre-wrap', lineHeight: 1.7, color: '#374151' }}>
                              {ds.description || '无'}
                            </Typography>
                          </Paper>

                          {/* 附件列表 */}
                          {connInfo?.files && connInfo.files.length > 0 && (
                            <Paper variant="outlined" sx={{
                              p: 3,
                              borderRadius: 2.5,
                              bgcolor: '#f9fafb',
                              borderColor: '#e5e7eb',
                            }}>
                              <Typography variant="caption" color="#6b7280" fontWeight={600} display="block" mb={2} fontSize={12.5}>
                                附件
                              </Typography>
                              <Stack spacing={1.5}>
                                {connInfo.files.map((f: string, i: number) => (
                                  <Chip
                                    key={i}
                                    icon={<InsertDriveFile sx={{ fontSize: 16, color: '#1a73e8' }} />}
                                    label={f.split('/').pop() || f}
                                    size="medium"
                                    sx={{
                                      justifyContent: 'flex-start',
                                      fontSize: 14,
                                      fontWeight: 500,
                                      height: 38,
                                      bgcolor: 'white',
                                      border: '1px solid #e5e7eb',
                                      color: '#374151',
                                      borderRadius: 2,
                                    }}
                                  />
                                ))}
                              </Stack>
                            </Paper>
                          )}

                          {/* 无附件提示 */}
                          {sourceType === 'text' && !connInfo?.files && (
                            <Box sx={{ textAlign: 'center', py: 5, color: '#9ca3af' }}>
                              <TextSnippet sx={{ fontSize: 44, mb: 2, opacity: 0.4 }} />
                              <Typography variant="caption" sx={{ fontSize: 13.5, color: '#9ca3af', fontWeight: 500 }}>
                                纯文本数据源
                              </Typography>
                            </Box>
                          )}
                        </Stack>
                      </Box>

                      {/* 右侧：AI 分析结果 */}
                      <Box
                        sx={{
                          flex: 1,
                          p: 3,
                          bgcolor: '#fafbfc',
                          minWidth: 0,
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '12px',
                            bgcolor: '#dbeafe',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'inset 0 2px 4px rgba(26,115,232,0.1)',
                          }}>
                            <Analytics sx={{ fontSize: 20, color: '#1a73e8' }} />
                          </Box>
                          <Typography variant="subtitle2" fontWeight={600} color="#1f1f1f" sx={{ fontSize: 15.5, letterSpacing: '-0.2px' }}>
                            AI 分析结果
                          </Typography>
                        </Box>

                        {ds.status === 'ready' && ds.schema_doc ? (
                          <Box component="pre" sx={{
                            fontSize: 13.5,
                            lineHeight: 1.7,
                            fontFamily: 'Consolas, Monaco, monospace',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            color: '#374151',
                          }}>
                            {ds.schema_doc}
                          </Box>
                        ) : ds.status === 'analyzing' ? (
                          <Box textAlign="center" py={12}>
                            <CircularProgress size={40} sx={{ mb: 3, color: '#1a73e8' }} />
                            <Typography variant="body2" color="#6b7280" sx={{ fontSize: 14.5, fontWeight: 500 }}>
                              AI 正在分析中，请查看上方的分析过程...
                            </Typography>
                          </Box>
                        ) : ds.status === 'error' ? (
                          <Alert
                            severity="error"
                            variant="outlined"
                            sx={{
                              borderRadius: 2.5,
                              fontSize: 14.5,
                              bgcolor: '#fef2f2',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              '& .MuiAlert-icon': { color: '#dc2626' },
                            }}
                          >
                            分析失败，请检查原始信息或重新尝试
                          </Alert>
                        ) : (
                          <Box textAlign="center" py={10}>
                            <Box sx={{
                              width: 72,
                              height: 72,
                              borderRadius: '20px',
                              bgcolor: '#f3f4f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mx: 'auto',
                              mb: 2.5,
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                            }}>
                              <Analytics sx={{ fontSize: 32, color: '#d1d5db' }} />
                            </Box>
                            <Typography variant="body2" color="#6b7280" sx={{ fontSize: 14.5, fontWeight: 500 }}>
                              暂无分析结果，点击上方的分析按钮开始
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Stack>
      )}

      {/* 创建数据源 Dialog */}
      <Dialog
        open={open}
        onClose={() => { setOpen(false); resetForm() }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid #f1f3f4',
            boxShadow: '0 24px 48px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)',
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #4285f4 0%, #34a853 50%, #fbbc04 75%, #ea4335 100%)',
              borderRadius: '4px 4px 0 0',
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 4, pt: 4, pb: 3, fontFamily: 'Google Sans, Roboto, sans-serif', fontWeight: 600, fontSize: 20, color: '#1f1f1f', letterSpacing: '-0.3px' }}>
          添加数据源
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 2 }}>
          <Stack spacing={3.5} mt={0.5}>
            <Alert
              severity="info"
              variant="outlined"
              sx={{
                fontSize: 13.5,
                fontWeight: 500,
                borderRadius: 3,
                bgcolor: '#eff6ff',
                color: '#1a73e8',
                border: '1px solid #bfdbfe',
                '& .MuiAlert-icon': { color: '#1a73e8' },
              }}
            >
              AI 将自动识别数据源类型（数据库/文件/纯文本），无需手动选择
            </Alert>
            <TextField
              label="名称"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              size="small"
              placeholder="给数据源起个名字"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '& fieldset': { borderColor: '#e5e7eb', borderWidth: 1.5 },
                  '&:hover fieldset': { borderColor: '#9ca3af' },
                  '&.Mui-focused fieldset': { borderColor: '#1a73e8', borderWidth: 2 },
                },
                '& .MuiInputLabel-root': {
                  fontSize: 15,
                  '&.Mui-focused': { color: '#1a73e8' },
                },
              }}
            />
            <TextField
              label="描述"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={4}
              fullWidth
              required
              size="small"
              placeholder="用自然语言描述你的数据源，例如：
- 数据库：MySQL 数据库在 192.168.1.100:3306，数据库名 shop...
- 文件：上传销售数据 Excel 文件，包含 2024 年订单记录...
- 纯文本：记录客户反馈的文本数据..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '& fieldset': { borderColor: '#e5e7eb', borderWidth: 1.5 },
                  '&:hover fieldset': { borderColor: '#9ca3af' },
                  '&.Mui-focused fieldset': { borderColor: '#1a73e8', borderWidth: 2 },
                },
                '& .MuiInputLabel-root': {
                  fontSize: 15,
                  '&.Mui-focused': { color: '#1a73e8' },
                },
              }}
            />
            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                size="small"
                sx={{
                  alignSelf: 'flex-start',
                  mb: 2,
                  color: '#1a73e8',
                  borderColor: '#bfdbfe',
                  fontWeight: 600,
                  fontSize: 14,
                  px: 2.5,
                  py: 1,
                  '&:hover': {
                    bgcolor: '#eff6ff',
                    borderColor: '#1a73e8',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(26,115,232,0.15)',
                  },
                }}
              >
                上传文件（可选）
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".csv,.xlsx,.xls,.txt,.json"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </Button>
              {files.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {files.map((f) => (
                    <Chip
                      key={f.name}
                      label={f.name}
                      size="small"
                      onDelete={() => setFiles(files.filter((x) => x !== f))}
                      icon={<InsertDriveFile sx={{ fontSize: 14, color: '#1a73e8' }} />}
                      sx={{
                        height: 32,
                        fontSize: 13,
                        fontWeight: 500,
                        borderRadius: 2.5,
                        px: 1.5,
                        bgcolor: '#f9fafb',
                        color: '#374151',
                        border: '1px solid #e5e7eb',
                        '&:hover': {
                          bgcolor: 'white',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                        },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
          <Button
            onClick={() => { setOpen(false); resetForm() }}
            sx={{
              color: '#6b7280',
              fontWeight: 600,
              fontSize: 14.5,
              px: 3,
              py: 1.5,
              borderRadius: 3,
              border: '1px solid #e5e7eb',
              bgcolor: 'white',
              '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' },
            }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={submitting || !name}
            sx={{
              bgcolor: '#1a73e8',
              color: 'white',
              fontWeight: 600,
              fontSize: 14.5,
              px: 3.5,
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(26,115,232,0.25), 0 1px 3px rgba(0,0,0,0.08)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#1557b0',
                boxShadow: '0 4px 16px rgba(26,115,232,0.3), 0 2px 6px rgba(0,0,0,0.12)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                bgcolor: '#e5e7eb',
                color: '#9ca3af',
                boxShadow: 'none',
              },
            }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : '创建并分析'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
