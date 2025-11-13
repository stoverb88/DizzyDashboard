'use client'

// AdminLayout.tsx
// Shared layout component for all admin pages with navigation sidebar

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Mail,
  UserPlus,
  Activity,
  LogOut,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react'
import type { SessionData } from '@/lib/session'

interface AdminLayoutProps {
  children: React.ReactNode
  session: SessionData
  currentPage: 'dashboard' | 'users' | 'invites' | 'medical' | 'sessions'
}

export function AdminLayout({ children, session, currentPage }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(true)

  // Detect mobile screen size and auto-adjust sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Auto-open sidebar on desktop, close on mobile
      if (!mobile) {
        setSidebarOpen(true)
      } else {
        setSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
    { id: 'invites', label: 'Invites', icon: Mail, href: '/admin/invites' },
    { id: 'medical', label: 'Medical Staff', icon: UserPlus, href: '/admin/medical' },
    { id: 'sessions', label: 'Sessions', icon: Activity, href: '/admin/sessions' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FFFFFF 0%, #C0C0C0 50%, #606060 100%)',
      display: 'flex',
    }}>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 40,
            }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '280px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRight: '1px solid #E5E7EB',
          backdropFilter: 'blur(10px)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        {/* Sidebar Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src="/DDlogobutton.svg" alt="Dizzy Dashboard" style={{ height: '40px', width: '40px' }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.25rem', color: '#1A202C', lineHeight: 1 }}>
                DIZZY
              </div>
              <div style={{ fontWeight: 500, fontSize: '0.875rem', color: '#6B7280', lineHeight: 1 }}>
                Admin Panel
              </div>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={20} color="#6B7280" />
            </button>
          )}
        </div>

        {/* User Info */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #E5E7EB',
        }}>
          <div style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1A202C',
            marginBottom: '2px',
          }}>
            {session.name || session.email || 'Admin User'}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#6B7280',
          }}>
            {session.email}
          </div>
          <div style={{
            marginTop: '8px',
            display: 'inline-block',
            padding: '4px 8px',
            backgroundColor: '#10B98120',
            color: '#10B981',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}>
            ADMINISTRATOR
          </div>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <a
                key={item.id}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  backgroundColor: isActive ? '#1A202C' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#374151',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                <Icon size={18} />
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* Back to App & Logout */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <a
            href="/app"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151',
              border: '1px solid #E5E7EB',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <ArrowLeft size={18} />
            Back to App
          </a>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#EF4444',
              backgroundColor: 'transparent',
              border: '1px solid #FCA5A5',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEF2F2'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? '0' : '280px',
        minHeight: '100vh',
      }}
      >
        {/* Mobile Header */}
        {isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 24px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderBottom: '1px solid #E5E7EB',
              backdropFilter: 'blur(10px)',
            }}
          >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <Menu size={24} color="#1A202C" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/DDlogobutton.svg" alt="Logo" style={{ height: '32px', width: '32px' }} />
            <span style={{ fontWeight: 900, fontSize: '1.125rem', color: '#1A202C' }}>
              DIZZY ADMIN
            </span>
          </div>
          </div>
        )}

        {/* Page Content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  )
}
