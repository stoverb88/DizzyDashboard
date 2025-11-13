'use client'

// AdminDashboard.tsx
// Main admin dashboard overview with navigation to all admin features

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, UserPlus, Activity, Shield, LayoutDashboard, type LucideIcon } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import type { SessionData } from '@/lib/session'

interface AdminDashboardProps {
  session: SessionData
}

type IconComponent = LucideIcon

interface DashboardStats {
  totalUsers: number
  medicalProfessionals: number
  patients: number
  activeInvites: number
  activeSessions: number
}

export default function AdminDashboard({ session }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  interface StatCard {
    title: string
    value: number
    icon: IconComponent
    color: string
    link: string
  }

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadStats()
  }, [])

  const statCards: StatCard[] = [
    {
      title: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: '#3B82F6',
      link: '/admin/users',
    },
    {
      title: 'Medical Professionals',
      value: stats?.medicalProfessionals ?? 0,
      icon: UserPlus,
      color: '#10B981',
      link: '/admin/medical',
    },
    {
      title: 'Patients',
      value: stats?.patients ?? 0,
      icon: Users,
      color: '#8B5CF6',
      link: '/admin/users?role=PATIENT',
    },
    {
      title: 'Active Invites',
      value: stats?.activeInvites ?? 0,
      icon: Mail,
      color: '#F59E0B',
      link: '/admin/invites',
    },
    {
      title: 'Active Sessions',
      value: stats?.activeSessions ?? 0,
      icon: Activity,
      color: '#EF4444',
      link: '/admin/sessions',
    },
  ]

  return (
    <AdminLayout session={session} currentPage="dashboard">
      <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', padding: '0 8px' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1A202C',
            marginBottom: '8px',
          }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Overview of your Dizzy Dashboard system
          </p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #E5E7EB',
                  height: '140px',
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#F3F4F6',
                  borderRadius: '12px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
          }}>
            {statCards.map((card, index) => {
              const Icon = card.icon
              return (
                <motion.a
                  key={card.title}
                  href={card.link}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #E5E7EB',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'box-shadow 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: `${card.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} color={card.color} />
                    </div>
                  </div>

                  <div>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: '#1A202C',
                      marginBottom: '4px',
                    }}>
                      {card.value.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6B7280',
                      fontWeight: 500,
                    }}>
                      {card.title}
                    </div>
                  </div>
                </motion.a>
              )
            })}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ marginTop: '32px' }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1A202C',
            marginBottom: '16px',
            padding: '0 8px',
          }}>
            Quick Actions
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px',
          }}>
            <QuickActionCard
              title="View All Users"
              description="Browse and manage all user accounts"
              icon={Users}
              href="/admin/users"
              color="#3B82F6"
            />
            <QuickActionCard
              title="Manage Invites"
              description="Create and manage invitation codes"
              icon={Mail}
              href="/admin/invites"
              color="#F59E0B"
            />
            <QuickActionCard
              title="Add Medical Professional"
              description="Quickly add a new clinician account"
              icon={UserPlus}
              href="/admin/medical"
              color="#10B981"
            />
            <QuickActionCard
              title="View Active Sessions"
              description="Monitor current user sessions"
              icon={Activity}
              href="/admin/sessions"
              color="#EF4444"
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  icon: IconComponent
  href: string
  color: string
}

function QuickActionCard({ title, description, icon: Icon, href, color }: QuickActionCardProps) {
  return (
    <motion.a
      href={href}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #E5E7EB',
        textDecoration: 'none',
        display: 'flex',
        gap: '16px',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: '#1A202C',
          marginBottom: '4px',
        }}>
          {title}
        </div>
        <div style={{
          fontSize: '0.875rem',
          color: '#6B7280',
        }}>
          {description}
        </div>
      </div>
    </motion.a>
  )
}
