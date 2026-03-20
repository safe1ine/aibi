import { useState } from 'react'
import { Box, Card, CardContent, TextField, Button, Typography, Alert, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff, AutoAwesome } from '@mui/icons-material'
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
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: '#f0f2f5',
      background: 'linear-gradient(180deg, #f0f2f5 0%, #e8eaed 100%)',
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 440,
        p: 3,
      }}>
        {/* Logo 区域 */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            mb: 2.5,
          }}>
            <Box sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc04 75%, #ea4335 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(66,133,244,0.25), 0 2px 6px rgba(0,0,0,0.08)',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: '16px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 50%)',
                pointerEvents: 'none',
              },
            }}>
              <AutoAwesome sx={{ color: 'white', fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
            </Box>
          </Box>
          <Typography sx={{
            fontFamily: 'Google Sans, Roboto, sans-serif',
            fontWeight: 500,
            fontSize: 28,
            color: '#1f1f1f',
            letterSpacing: '-0.5px',
            mb: 1,
          }}>
            CatBI
          </Typography>
          <Typography variant="body2" color="#6b7280" sx={{ fontSize: 14.5, lineHeight: 1.5 }}>
            登录你的数据分析助手
          </Typography>
        </Box>

        {/* 登录卡片 */}
        <Card sx={{
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255,255,255,0.8)',
          bgcolor: 'white',
          overflow: 'visible',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #4285f4 0%, #34a853 50%, #fbbc04 75%, #ea4335 100%)',
            borderRadius: '4px 4px 0 0',
          },
        }}>
          <CardContent sx={{ p: 4, pt: 3.5 }}>
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  fontSize: 13.5,
                  fontWeight: 500,
                  bgcolor: '#fef2f2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  '& .MuiAlert-icon': { color: '#dc2626' },
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={3}>
              <TextField
                label="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                required
                autoComplete="username"
                variant="outlined"
                placeholder="请输入用户名"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontSize: 15,
                    '& fieldset': { borderColor: '#e5e7eb', borderWidth: 1.5 },
                    '&:hover fieldset': { borderColor: '#9ca3af' },
                    '&.Mui-focused fieldset': { borderColor: '#4285f4', borderWidth: 2 },
                    '& input::placeholder': { color: '#9ca3af', opacity: 1 },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: 15,
                    '&.Mui-focused': { color: '#4285f4' },
                  },
                }}
              />
              <TextField
                label="密码"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                autoComplete="current-password"
                variant="outlined"
                placeholder="请输入密码"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPwd(!showPwd)}
                        edge="end"
                        aria-label={showPwd ? '隐藏密码' : '显示密码'}
                        sx={{
                          color: '#6b7280',
                          '&:hover': { bgcolor: 'rgba(26,115,232,0.04)', color: '#1a73e8' },
                        }}
                      >
                        {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontSize: 15,
                    '& fieldset': { borderColor: '#e5e7eb', borderWidth: 1.5 },
                    '&:hover fieldset': { borderColor: '#9ca3af' },
                    '&.Mui-focused fieldset': { borderColor: '#4285f4', borderWidth: 2 },
                    '& input::placeholder': { color: '#9ca3af', opacity: 1 },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: 15,
                    '&.Mui-focused': { color: '#4285f4' },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || !username || !password}
                fullWidth
                sx={{
                  mt: 1.5,
                  py: 1.75,
                  fontSize: 15.5,
                  fontWeight: 600,
                  borderRadius: 3,
                  bgcolor: '#1a73e8',
                  color: 'white',
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
                {loading ? '登录中...' : '登录'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* 底部版权信息 */}
        <Typography
          variant="caption"
          color="#9ca3af"
          sx={{
            display: 'block',
            textAlign: 'center',
            mt: 4.5,
            fontSize: 12.5,
            fontWeight: 400,
          }}
        >
          © 2026 CatBI. All rights reserved.
        </Typography>
      </Box>
    </Box>
  )
}
