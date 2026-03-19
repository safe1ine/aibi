import { useState } from 'react'
import { Box, Card, CardContent, TextField, Button, Typography, Alert, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import api from '../api'

export default function Login() {
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { username, password })
      setToken(data.token)
      navigate('/')
    } catch {
      setError('用户名或密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #EFF6FF 0%, #F8FAFC 50%, #EEF2FF 100%)',
    }}>
      <Card sx={{ width: 380, borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 8px 32px rgba(30,64,175,0.08)' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ mb: 4 }}>
            <Typography sx={{ fontFamily: '"Fira Code", monospace', fontWeight: 700, fontSize: 22, color: 'primary.main', letterSpacing: '-0.5px' }}>
              CatBI
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              数据分析助手，登录后开始使用
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth required
              size="medium"
              autoComplete="username"
            />
            <TextField
              label="密码"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth required
              size="medium"
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPwd(!showPwd)} edge="end" aria-label={showPwd ? '隐藏密码' : '显示密码'}>
                      {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !username || !password}
              fullWidth
              sx={{ mt: 1, py: 1.2, fontSize: 15, borderRadius: 2 }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
