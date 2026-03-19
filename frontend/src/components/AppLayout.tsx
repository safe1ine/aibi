import { Navigate } from 'react-router-dom'
import { Box, Tabs, Tab, Typography, Button, Divider } from '@mui/material'
import { Logout, ChatBubbleOutline, StorageOutlined, TuneOutlined } from '@mui/icons-material'
import { useState } from 'react'
import { useAuthStore } from '../store/auth'
import Chat from '../pages/Chat'
import Settings from '../pages/Settings'

export default function AppLayout() {
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const [tab, setTab] = useState(0)

  if (!token) return <Navigate to="/login" replace />

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default' }}>
      {/* 顶栏 */}
      <Box sx={{
        display: 'flex', alignItems: 'center', px: 3,
        bgcolor: 'white',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        height: 52,
        flexShrink: 0,
      }}>
        <Typography
          sx={{
            fontFamily: '"Fira Code", monospace',
            fontWeight: 700,
            fontSize: 17,
            color: 'primary.main',
            letterSpacing: '-0.3px',
            mr: 4,
            userSelect: 'none',
          }}
        >
          CatBI
        </Typography>

        <Divider orientation="vertical" flexItem sx={{ mr: 3, my: 1.2 }} />

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            flex: 1,
            minHeight: 52,
            '& .MuiTabs-indicator': { height: 2, borderRadius: '2px 2px 0 0' },
          }}
        >
          {[
            { label: '对话', icon: <ChatBubbleOutline sx={{ fontSize: 16 }} /> },
            { label: '数据源', icon: <StorageOutlined sx={{ fontSize: 16 }} /> },
            { label: '大模型', icon: <TuneOutlined sx={{ fontSize: 16 }} /> },
          ].map((item) => (
            <Tab
              key={item.label}
              label={item.label}
              icon={item.icon}
              iconPosition="start"
              sx={{ minHeight: 52, gap: 0.5, px: 2, fontSize: 13.5 }}
            />
          ))}
        </Tabs>

        <Button
          size="small"
          startIcon={<Logout sx={{ fontSize: 15 }} />}
          onClick={logout}
          sx={{ color: 'text.secondary', fontSize: 13, '&:hover': { color: 'error.main' } }}
        >
          退出
        </Button>
      </Box>

      {/* 内容区 */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {tab === 0 && <Chat />}
        {tab === 1 && <Settings initialTab="datasources" />}
        {tab === 2 && <Settings initialTab="llm" />}
      </Box>
    </Box>
  )
}
