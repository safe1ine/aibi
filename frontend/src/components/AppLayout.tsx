import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Box, Tabs, Tab, Typography, Button, Divider, Avatar } from '@mui/material'
import { Logout, ChatBubbleOutline, StorageOutlined, TuneOutlined, AutoAwesome } from '@mui/icons-material'
import { useAuthStore } from '../store/auth'
import { Outlet } from 'react-router-dom'

export default function AppLayout() {
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const username = useAuthStore((s) => s.username)
  const navigate = useNavigate()
  const location = useLocation()

  if (!token) return <Navigate to="/login" replace />

  const getTabValue = () => {
    if (location.pathname === '/chat') return 0
    if (location.pathname === '/datasources') return 1
    if (location.pathname === '/llm') return 2
    return 0
  }

  const menuItems = [
    {
      label: '智能对话',
      icon: <ChatBubbleOutline sx={{ fontSize: 18 }} />,
      path: '/chat',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      label: '数据源',
      icon: <StorageOutlined sx={{ fontSize: 18 }} />,
      path: '/datasources',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      label: '大模型',
      icon: <TuneOutlined sx={{ fontSize: 18 }} />,
      path: '/llm',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f0f2f5' }}>
      {/* 顶部导航栏 - Google Material Design 3 风格 */}
      <Box sx={{
        display: 'flex', alignItems: 'center', px: 2, py: 1.5,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f3f4',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)',
        flexShrink: 0,
        zIndex: 1000,
        position: 'sticky',
        top: 0,
      }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mr: 2, px: 1 }}>
          <Box sx={{
            width: 42, height: 42,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc04 75%, #ea4335 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(66,133,244,0.2), 0 1px 3px rgba(0,0,0,0.08)',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 0,
              borderRadius: '12px',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
              pointerEvents: 'none',
            },
          }}>
            <AutoAwesome sx={{ color: 'white', fontSize: 22, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} />
          </Box>
          <Typography
            sx={{
              fontFamily: 'Google Sans, Roboto, sans-serif',
              fontWeight: 500,
              fontSize: 21,
              color: '#1f1f1f',
              letterSpacing: '-0.3px',
            }}
          >
            CatBI
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mr: 2, my: 1, borderColor: '#f1f3f4', mx: 1 }} />

        {/* 导航 Tabs */}
        <Tabs
          value={getTabValue()}
          onChange={(_, v) => navigate(menuItems[v].path)}
          sx={{
            flex: 1,
            minHeight: 40,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: 3,
              bgcolor: '#1a73e8',
              boxShadow: '0 0 4px rgba(26,115,232,0.3)',
            },
            gap: 1,
          }}
        >
          {menuItems.map((item) => {
            const isSelected = getTabValue() === menuItems.indexOf(item)
            return (
              <Tab
                key={item.label}
                label={item.label}
                icon={item.icon}
                iconPosition="start"
                sx={{
                  minHeight: 40,
                  gap: 1,
                  px: 3,
                  py: 1,
                  fontSize: 14,
                  fontWeight: 500,
                  color: isSelected ? '#1f1f1f' : '#6b7280',
                  borderRadius: 3,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: 'auto',
                  '& .MuiTab-icon': {
                    fontSize: 18,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  '&:hover': {
                    bgcolor: 'rgba(26,115,232,0.06)',
                    color: '#1f1f1f',
                    '& .MuiTab-icon': {
                      color: '#1a73e8',
                    },
                  },
                  '&.Mui-selected': {
                    bgcolor: 'rgba(26,115,232,0.08)',
                    color: '#1a73e8',
                    '& .MuiTab-icon': {
                      color: '#1a73e8',
                    },
                  },
                }}
              />
            )
          })}
        </Tabs>

        {/* 用户信息 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 1.25,
            borderRadius: '12px',
            bgcolor: '#f8f9fa',
            border: '1px solid #f1f3f4',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              bgcolor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderColor: '#e5e7eb',
            },
          }}>
            <Avatar
              sx={{
                width: 34, height: 34,
                background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                fontSize: 15,
                fontWeight: 600,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              {username?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#1f1f1f' }}>
              {username || 'User'}
            </Typography>
          </Box>

          <Button
            size="small"
            startIcon={<Logout sx={{ fontSize: 16 }} />}
            onClick={logout}
            sx={{
              color: '#6b7280',
              fontSize: 14,
              fontWeight: 500,
              px: 2,
              py: 1.25,
              borderRadius: 2.5,
              border: '1px solid #e5e7eb',
              bgcolor: 'white',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                color: '#dc2626',
                borderColor: '#fecaca',
                bgcolor: '#fef2f2',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(220,38,38,0.15)',
              },
            }}
          >
            退出
          </Button>
        </Box>
      </Box>

      {/* 内容面板 */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        p: { xs: 2, sm: 3 },
        bgcolor: '#f0f2f5',
      }}>
        <Box sx={{
          maxWidth: 1280,
          mx: 'auto',
          height: '100%',
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
