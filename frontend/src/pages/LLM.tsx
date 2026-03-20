import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Card, CardContent, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Select, MenuItem, FormControl,
  InputLabel, IconButton, Stack, Divider,
} from '@mui/material'
import { Add, Delete, Edit, CheckCircle, Tune, AutoAwesome } from '@mui/icons-material'
import api from '../api'

interface LLMConfig {
  id: number; name: string; provider: string
  base_url: string; api_key: string; model: string; is_active: boolean
}

const PRESETS = [
  { label: 'Claude', provider: 'anthropic', base_url: 'https://api.anthropic.com', model: 'claude-sonnet-4-6' },
  { label: 'OpenAI', provider: 'openai', base_url: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { label: 'DeepSeek', provider: 'openai', base_url: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { label: 'Qwen', provider: 'openai', base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
  { label: 'MiniMax', provider: 'openai', base_url: 'https://api.minimax.chat/v1', model: 'MiniMax-Text-01' },
  { label: 'Ollama', provider: 'openai', base_url: 'http://localhost:11434/v1', model: 'llama3' },
]

const emptyForm = { name: '', provider: 'openai', base_url: '', api_key: '', model: '' }

export default function LLM() {
  const [configs, setConfigs] = useState<LLMConfig[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<LLMConfig | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchConfigs = async () => {
    const { data } = await api.get('/settings/llm')
    setConfigs(data)
  }

  useEffect(() => { fetchConfigs() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const openEdit = (c: LLMConfig) => { setEditing(c); setForm({ ...c, api_key: '' }); setOpen(true) }

  const handleSubmit = async () => {
    try {
      if (editing) {
        await api.put(`/settings/llm/${editing.id}`, form)
      } else {
        await api.post('/settings/llm', form)
      }
      setOpen(false); fetchConfigs()
    } catch { alert('操作失败') }
  }

  return (
    <>
      {/* 顶部标题区 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={600} sx={{ fontSize: 24, color: '#1f1f1f', mb: 0.5, letterSpacing: '-0.3px' }}>
            大模型配置
          </Typography>
          <Typography variant="body2" color="#6b7280" sx={{ fontSize: 14.5, lineHeight: 1.5 }}>
            配置用于数据分析和智能问答的 AI 模型
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreate}
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
          添加模型
        </Button>
      </Box>

      {configs.length === 0 ? (
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
            width: 72,
            height: 72,
            borderRadius: '20px',
            bgcolor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
          }}>
            <Tune sx={{ fontSize: 36, color: '#9ca3af' }} />
          </Box>
          <Typography variant="h6" color="#1f1f1f" fontWeight={600} gutterBottom sx={{ fontSize: 20, letterSpacing: '-0.3px' }}>
            还没有配置模型
          </Typography>
          <Typography variant="body2" color="#6b7280" sx={{ fontSize: 14.5, mb: 3 }}>
            点击右上角按钮添加一个大模型配置
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2.5}>
          {configs.map((c) => (
            <Card key={c.id} sx={{
              borderRadius: 3,
              border: '1px solid #f1f3f4',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              bgcolor: 'white',
              boxShadow: c.is_active ? '0 4px 16px rgba(26,115,232,0.12), 0 2px 6px rgba(26,115,232,0.06)' : '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
              ...(c.is_active && {
                borderColor: '#93c5fd',
                bgcolor: '#eff6ff',
              }),
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
                transform: 'translateY(-2px)',
              },
            }}>
              <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2.5}>
                  <Box display="flex" alignItems="center" gap={2.5} flexWrap="wrap">
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      bgcolor: c.is_active ? '#dbeafe' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: c.is_active ? 'inset 0 2px 4px rgba(26,115,232,0.15)' : 'inset 0 2px 4px rgba(0,0,0,0.06)',
                    }}>
                      <AutoAwesome sx={{ fontSize: 24, color: c.is_active ? '#1a73e8' : '#6b7280' }} />
                    </Box>
                    <Box>
                      <Typography fontWeight={600} fontSize={15.5} color="#1f1f1f" sx={{ letterSpacing: '-0.2px' }}>{c.name}</Typography>
                      <Box display="flex" alignItems="center" gap={2} mt={1} flexWrap="wrap">
                        <Chip
                          label={c.provider}
                          size="small"
                          sx={{
                            height: 26,
                            fontSize: 12.5,
                            fontWeight: 600,
                            bgcolor: c.provider === 'anthropic' ? '#fce7f3' : '#dbeafe',
                            color: c.provider === 'anthropic' ? '#db2777' : '#1a73e8',
                            border: 'none',
                            boxShadow: c.provider === 'anthropic' ? '0 1px 3px rgba(219,39,119,0.15)' : '0 1px 3px rgba(26,115,232,0.15)',
                          }}
                        />
                        <Typography variant="body2" color="#6b7280" fontSize={14} sx={{ fontWeight: 500 }}>{c.model}</Typography>
                      </Box>
                    </Box>
                    {c.is_active && (
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                        label="使用中"
                        size="small"
                        sx={{
                          height: 26,
                          fontSize: 12.5,
                          fontWeight: 600,
                          bgcolor: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0',
                          boxShadow: '0 1px 3px rgba(21,128,61,0.15)',
                        }}
                      />
                    )}
                  </Box>
                  <Box display="flex" gap={1} alignItems="center" flexShrink={0}>
                    {!c.is_active && (
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: 13.5,
                          fontWeight: 600,
                          py: 1,
                          px: 2,
                          borderRadius: 2.5,
                          color: '#1a73e8',
                          borderColor: '#bfdbfe',
                          bgcolor: 'white',
                          '&:hover': {
                            bgcolor: '#eff6ff',
                            borderColor: '#1a73e8',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(26,115,232,0.15)',
                          },
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onClick={async () => { await api.post(`/settings/llm/${c.id}/activate`); fetchConfigs() }}
                      >
                        设为使用
                      </Button>
                    )}
                    <IconButton
                      size="medium"
                      onClick={() => openEdit(c)}
                      sx={{
                        color: '#6b7280',
                        '&:hover': { bgcolor: 'rgba(26,115,232,0.04)', color: '#1a73e8' },
                      }}
                    >
                      <Edit sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton
                      size="medium"
                      color="error"
                      onClick={async () => { await api.delete(`/settings/llm/${c.id}`); fetchConfigs() }}
                      sx={{
                        '&:hover': { bgcolor: '#fef2f2', color: '#dc2626' },
                      }}
                    >
                      <Delete sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* 添加/编辑 Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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
          {editing ? '编辑配置' : '添加大模型'}
        </DialogTitle>
        <DialogContent sx={{ px: 4, py: 2 }}>
          <Stack spacing={3.5} mt={0.5}>
            <Box>
              <Typography variant="caption" color="#6b7280" fontWeight={600} mb={2} display="block" fontSize={12.5}>
                快速填入
              </Typography>
              <Box display="flex" gap={1.5} flexWrap="wrap">
                {PRESETS.map((p) => (
                  <Chip
                    key={p.label}
                    label={p.label}
                    size="small"
                    clickable
                    variant="outlined"
                    onClick={() => setForm((f) => ({ ...f, name: p.label, provider: p.provider, base_url: p.base_url, model: p.model }))}
                    sx={{
                      cursor: 'pointer',
                      fontSize: 13.5,
                      fontWeight: 600,
                      borderRadius: 2.5,
                      height: 32,
                      px: 1.5,
                      color: '#374151',
                      borderColor: '#e5e7eb',
                      bgcolor: 'white',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: '#f9fafb',
                        borderColor: '#1a73e8',
                        color: '#1a73e8',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
            <Divider sx={{ borderColor: '#f1f3f4' }} />
            <TextField
              label="名称"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth
              required
              size="small"
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
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>接口类型</InputLabel>
              <Select
                value={form.provider}
                label="接口类型"
                onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
                sx={{
                  borderRadius: 3,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb', borderWidth: 1.5 },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#9ca3af' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1a73e8', borderWidth: 2 },
                }}
              >
                <MenuItem value="openai" sx={{ fontSize: 14.5, borderRadius: 2, mx: 1 }}>OpenAI 兼容</MenuItem>
                <MenuItem value="anthropic" sx={{ fontSize: 14.5, borderRadius: 2, mx: 1 }}>Anthropic</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Base URL"
              value={form.base_url}
              onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))}
              fullWidth
              required
              size="small"
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
              label="API Key"
              type="password"
              value={form.api_key}
              onChange={(e) => setForm((f) => ({ ...f, api_key: e.target.value }))}
              placeholder={editing ? '不填则保持不变' : ''}
              fullWidth
              required={!editing}
              size="small"
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
              label="模型"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              fullWidth
              required
              size="small"
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
          <Button
            onClick={() => setOpen(false)}
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
            onClick={handleSubmit}
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
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
