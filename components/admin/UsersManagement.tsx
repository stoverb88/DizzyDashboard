'use client'

// UsersManagement.tsx
// User list view with filtering, sorting, and user details

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, Shield, User, Mail, Calendar } from 'lucide-react'
import { AdminLayout } from './AdminLayout'
import type { SessionData } from '@/lib/session'
import type { UserRole } from '@prisma/client'

interface UsersManagementProps {
  session: SessionData
}

interface UserData {
  id: string
  email: string | null
  name: string | null
  role: UserRole
  createdAt: string
}

export default function UsersManagement({ session }: UsersManagementProps) {
  const [users, setUsers] = useState<UserData[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'role'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterAndSortUsers()
  }, [users, searchTerm, roleFilter, sortBy, sortOrder])

  async function loadUsers() {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function filterAndSortUsers() {
    let result = [...users]

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      result = result.filter(
        (u) =>
          u.email?.toLowerCase().includes(search) ||
          u.name?.toLowerCase().includes(search)
      )
    }

    // Apply role filter
    if (roleFilter !== 'ALL') {
      result = result.filter((u) => u.role === roleFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: any = a[sortBy]
      let bVal: any = b[sortBy]

      if (sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      } else {
        aVal = (aVal || '').toString().toLowerCase()
        bVal = (bVal || '').toString().toLowerCase()
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredUsers(result)
  }

  function getRoleBadgeColor(role: UserRole) {
    switch (role) {
      case 'ADMIN':
        return { bg: '#10B98120', color: '#10B981' }
      case 'MEDICAL_PROFESSIONAL':
        return { bg: '#3B82F620', color: '#3B82F6' }
      case 'PATIENT':
        return { bg: '#8B5CF620', color: '#8B5CF6' }
      default:
        return { bg: '#6B728020', color: '#6B7280' }
    }
  }

  function formatRoleLabel(role: UserRole) {
    switch (role) {
      case 'MEDICAL_PROFESSIONAL':
        return 'Medical Professional'
      default:
        return role.charAt(0) + role.slice(1).toLowerCase()
    }
  }

  return (
    <AdminLayout session={session} currentPage="users">
      <div style={{ padding: '16px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', padding: '0 8px' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1A202C',
            marginBottom: '8px',
          }}>
            Users Management
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            View and manage all user accounts ({filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'})
          </p>
        </div>

        {/* Filters Bar */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #E5E7EB',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px',
          }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6B7280',
                }}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  fontSize: '0.875rem',
                  backgroundColor: '#FFFFFF',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                fontSize: '0.875rem',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MEDICAL_PROFESSIONAL">Medical Professional</option>
              <option value="PATIENT">Patient</option>
            </select>

            {/* Sort By */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-')
                setSortBy(sort as any)
                setSortOrder(order as any)
              }}
              style={{
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                fontSize: '0.875rem',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="email-asc">Email (A-Z)</option>
              <option value="email-desc">Email (Z-A)</option>
              <option value="role-asc">Role (A-Z)</option>
              <option value="role-desc">Role (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #E5E7EB',
                  height: '80px',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            padding: '48px',
            border: '1px solid #E5E7EB',
            textAlign: 'center',
          }}>
            <User size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1A202C', marginBottom: '8px' }}>
              No users found
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {filteredUsers.map((user, index) => {
              const roleColors = getRoleBadgeColor(user.role)
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid #E5E7EB',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}>
                    {/* User Info */}
                    <div style={{ flex: 1, minWidth: '0', width: '100%' }}>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#1A202C',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {user.name || user.email || 'Unnamed User'}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexWrap: 'wrap',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={14} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                            {user.email || 'No email'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div style={{
                      padding: '6px 12px',
                      backgroundColor: roleColors.bg,
                      color: roleColors.color,
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {formatRoleLabel(user.role)}
                    </div>

                    {/* Created Date */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.875rem',
                      color: '#6B7280',
                    }}>
                      <Calendar size={14} />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
