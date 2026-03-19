import { useEffect, useRef, useState } from 'react'
import {
  Box, Typography, Button, Card, CardContent, CardActions,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  IconButton, Tooltip, Alert, CircularProgress, Stack, Divider,
} from '@mui/material'
import { Add, Refresh, Delete, CheckCircle, Edit, CloudUpload, Storage, InsertDriveFile, Tune } from '@mui/icons-material'
import api from '../api'

// ── 数据源 Tab ───────────────────────────────────────────────────────────────

interface DataSource {
  id: number; name: string; type: 'database' | 'file'
  description: string; schema_doc: string | null
  status: 'pending' | 'analyzing' | 'ready' | 'error'; error_message: string | null
}

const statusColor: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'default', analyzing: 'warning', ready: 'success', error: 'error',
}
const statusLabel: Record<string, string> = {
  pending: '待分析', analyzing: '分析中', ready: '就绪', error: '错误',
}

function DataSourcesTab() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [schemaDs, setSchemaDs] = useState<DataSource | null>(null)
  const [dsType, setDsType] = useState<'database' | 'file'>('database')
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

  const resetForm = () => { setName(''); setDescription(''); setFiles([]); setDsType('database') }

  const handleCreate = async () => {
    setSubmitting(true)
    try {
      if (dsType === 'database') {
        await api.post('/datasources/database', { name, description })
      } else {
        const fd = new FormData()
        fd.append('name', name)
        fd.append('description', description)
        files.forEach((f) => fd.append('files', f))
        await api.post('/datasources/file', fd)
      }
      setOpen(false); resetForm(); fetchSources()
    } catch (e: any) {
      alert(e.response?.data?.detail || '创建失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Fira Code", monospace' }}>数据源</Typography>
          <Typography variant="caption" color="text.secondary">配置后 AI 将自动分析数据结构</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} size="small">添加数据源</Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" pt={6}><CircularProgress size={28} /></Box>
      ) : sources.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
          <Storage sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
          <Typography variant="body2">还没有数据源，点击右上角添加</Typography>
        </Box>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={2}>
          {sources.map((ds) => (
            <Card key={ds.id} variant="outlined" sx={{
              borderRadius: 2.5, cursor: ds.schema_doc ? 'pointer' : 'default',
              border: '1px solid #e2e8f0',
              '&:hover': ds.schema_doc ? { borderColor: 'primary.light', boxShadow: '0 4px 16px rgba(30,64,175,0.08)' } : {},
              transition: 'all 0.2s',
            }} onClick={() => ds.schema_doc && setSchemaDs(ds)}>
              <CardContent sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {ds.type === 'database'
                      ? <Storage sx={{ fontSize: 16, color: 'primary.main' }} />
                      : <InsertDriveFile sx={{ fontSize: 16, color: 'secondary.main' }} />}
                    <Typography fontWeight={600} fontSize={14}>{ds.name}</Typography>
                  </Box>
                  <Chip label={statusLabel[ds.status]} color={statusColor[ds.status]} size="small"
                    sx={{ height: 20, fontSize: 11, fontWeight: 500 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12.5, lineHeight: 1.5 }}>
                  {ds.description || '无描述'}
                </Typography>
                {ds.error_message && <Alert severity="error" sx={{ mt: 1, py: 0, fontSize: 12 }}>{ds.error_message}</Alert>}
                {ds.status === 'ready' && (
                  <Typography variant="caption" color="success.main" sx={{ mt: 0.5, display: 'block' }}>点击查看结构说明</Typography>
                )}
              </CardContent>
              <CardActions sx={{ px: 1.5, pb: 1, pt: 0 }}>
                <Tooltip title="重新分析">
                  <IconButton size="small" onClick={async (e) => {
                    e.stopPropagation()
                    await api.post(`/datasources/${ds.id}/reanalyze`)
                    fetchSources()
                  }} sx={{ cursor: 'pointer' }}><Refresh sx={{ fontSize: 16 }} /></IconButton>
                </Tooltip>
                <Tooltip title="删除">
                  <IconButton size="small" color="error" onClick={async (e) => {
                    e.stopPropagation()
                    await api.delete(`/datasources/${ds.id}`)
                    fetchSources()
                  }} sx={{ cursor: 'pointer' }}><Delete sx={{ fontSize: 16 }} /></IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => { setOpen(false); resetForm() }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, fontFamily: '"Fira Code", monospace', fontWeight: 600 }}>添加数据源</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['database', 'file'] as const).map((t) => (
                <Chip key={t} label={t === 'database' ? '数据库' : '文件 (CSV/Excel)'}
                  icon={t === 'database' ? <Storage sx={{ fontSize: 14 }} /> : <InsertDriveFile sx={{ fontSize: 14 }} />}
                  onClick={() => setDsType(t)} variant={dsType === t ? 'filled' : 'outlined'}
                  color={dsType === t ? 'primary' : 'default'} sx={{ cursor: 'pointer' }} />
              ))}
            </Box>
            <TextField label="名称" value={name} onChange={(e) => setName(e.target.value)} fullWidth required size="small" />
            {dsType === 'database' ? (
              <TextField label="描述" value={description} onChange={(e) => setDescription(e.target.value)}
                multiline rows={4} fullWidth required size="small"
                placeholder="用自然语言描述数据库，例如：MySQL 数据库在 192.168.1.100:3306，数据库名 shop，用户名 root 密码 xxx..." />
            ) : (
              <>
                <Button component="label" variant="outlined" startIcon={<CloudUpload />} size="small" sx={{ alignSelf: 'flex-start' }}>
                  选择文件
                  <input type="file" hidden multiple accept=".csv,.xlsx,.xls" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                </Button>
                {files.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {files.map((f) => <Chip key={f.name} label={f.name} size="small" onDelete={() => setFiles(files.filter((x) => x !== f))} />)}
                  </Box>
                )}
                <TextField label="补充说明（可选）" value={description} onChange={(e) => setDescription(e.target.value)}
                  multiline rows={2} fullWidth size="small" placeholder="描述这些文件的业务含义..." />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => { setOpen(false); resetForm() }}>取消</Button>
          <Button variant="contained" onClick={handleCreate} disabled={submitting || !name}>
            {submitting ? <CircularProgress size={16} /> : '创建并分析'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!schemaDs} onClose={() => setSchemaDs(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontFamily: '"Fira Code", monospace', fontWeight: 600 }}>{schemaDs?.name} — 结构说明</DialogTitle>
        <Divider />
        <DialogContent>
          <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: 13, maxHeight: 480, overflow: 'auto', m: 0, fontFamily: '"Fira Code", monospace', lineHeight: 1.7 }}>
            {schemaDs?.schema_doc}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => setSchemaDs(null)}>关闭</Button></DialogActions>
      </Dialog>
    </>
  )
}

// ── 大模型 Tab ───────────────────────────────────────────────────────────────

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

function LLMTab() {
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
      editing ? await api.put(`/settings/llm/${editing.id}`, form) : await api.post('/settings/llm', form)
      setOpen(false); fetchConfigs()
    } catch { alert('操作失败') }
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Fira Code", monospace' }}>大模型</Typography>
          <Typography variant="caption" color="text.secondary">配置用于数据分析的 AI 模型</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} size="small">添加</Button>
      </Box>

      {configs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
          <Tune sx={{ fontSize: 40, mb: 1, opacity: 0.3 }} />
          <Typography variant="body2">还没有配置，先添加一个大模型</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {configs.map((c) => (
            <Card key={c.id} variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', transition: 'all 0.2s',
              ...(c.is_active && { borderColor: 'primary.light', bgcolor: '#EFF6FF' }) }}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
                    <Typography fontWeight={600} fontSize={14}>{c.name}</Typography>
                    <Chip label={c.provider} size="small" variant="outlined"
                      color={c.provider === 'anthropic' ? 'secondary' : 'primary'}
                      sx={{ height: 20, fontSize: 11 }} />
                    <Typography variant="body2" color="text.secondary" fontSize={13}>{c.model}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: { xs: 'none', sm: 'block' } }}>{c.base_url}</Typography>
                    {c.is_active && (
                      <Chip icon={<CheckCircle sx={{ fontSize: '14px !important' }} />} label="使用中"
                        size="small" color="success" sx={{ height: 20, fontSize: 11 }} />
                    )}
                  </Box>
                  <Box display="flex" gap={0.5} alignItems="center" flexShrink={0}>
                    {!c.is_active && (
                      <Button size="small" variant="outlined" sx={{ fontSize: 12, py: 0.3, cursor: 'pointer' }}
                        onClick={async () => { await api.post(`/settings/llm/${c.id}/activate`); fetchConfigs() }}>
                        设为使用
                      </Button>
                    )}
                    <IconButton size="small" onClick={() => openEdit(c)} sx={{ cursor: 'pointer' }}><Edit sx={{ fontSize: 16 }} /></IconButton>
                    <IconButton size="small" color="error" sx={{ cursor: 'pointer' }}
                      onClick={async () => { await api.delete(`/settings/llm/${c.id}`); fetchConfigs() }}>
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontFamily: '"Fira Code", monospace', fontWeight: 600 }}>{editing ? '编辑配置' : '添加大模型'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <Box>
              <Typography variant="caption" color="text.secondary" mb={0.5} display="block">快速填入</Typography>
              <Box display="flex" gap={0.8} flexWrap="wrap">
                {PRESETS.map((p) => (
                  <Chip key={p.label} label={p.label} size="small" clickable variant="outlined"
                    onClick={() => setForm((f) => ({ ...f, name: p.label, provider: p.provider, base_url: p.base_url, model: p.model }))}
                    sx={{ cursor: 'pointer', fontSize: 12 }} />
                ))}
              </Box>
            </Box>
            <Divider />
            <TextField label="名称" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} fullWidth required size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>接口类型</InputLabel>
              <Select value={form.provider} label="接口类型" onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}>
                <MenuItem value="openai">OpenAI 兼容</MenuItem>
                <MenuItem value="anthropic">Anthropic</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Base URL" value={form.base_url} onChange={(e) => setForm((f) => ({ ...f, base_url: e.target.value }))} fullWidth required size="small" />
            <TextField label="API Key" type="password" value={form.api_key}
              onChange={(e) => setForm((f) => ({ ...f, api_key: e.target.value }))}
              placeholder={editing ? '不填则保持不变' : ''} fullWidth required={!editing} size="small" />
            <TextField label="模型" value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} fullWidth required size="small" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleSubmit}>保存</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

// ── 导出 ─────────────────────────────────────────────────────────────────────

export { DataSourcesTab, LLMTab }

export default function Settings({ initialTab }: { initialTab: 'datasources' | 'llm' }) {
  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      {initialTab === 'datasources' ? <DataSourcesTab /> : <LLMTab />}
    </Box>
  )
}
