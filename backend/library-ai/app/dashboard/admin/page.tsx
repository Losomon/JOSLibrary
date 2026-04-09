'use server'

import { requireAdmin } from '../../lib/auth'
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  const { profile } = await requireAdmin()
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p>Welcome, {profile?.full_name ?? 'Admin'} (Admin)</p>
      
      <div className="grid gap-4 mt-8">
        <Button>Manage Books</Button>
        <Button>Manage Users</Button>
        <Button>View Orders</Button>
      </div>
    </div>
  )
}

