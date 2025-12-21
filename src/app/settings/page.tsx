"use client";
import React, { useState } from "react";
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { exportAllData } from "@/lib/bos/export/exportService";
import BarangayProfileTab from "@/features/settings/BarangayProfileTab";
import AIProfileTab from "@/features/settings/AIProfileTab";
import DeviceSettingsTab from "@/features/settings/DeviceSettingsTab";

// Mock data for user management UI
const mockUsers = [
  { id: 'user-1', name: 'Maria Clara', email: 'secretary@brgy-dau.gov', role: 'Secretary', avatar: 'MC' },
  { id: 'user-2', name: 'Jose Rizal', email: 'treasurer@brgy-dau.gov', role: 'Treasurer', avatar: 'JR' },
  { id: 'user-3', name: 'Andres Bonifacio', email: 'tanod-01@brgy-dau.gov', role: 'Tanod', avatar: 'AB' },
];

type UserRole = 'Admin' | 'Secretary' | 'Treasurer' | 'Tanod' | 'Staff';
type MockUser = typeof mockUsers[0];

const EditUserModal = ({ user, isOpen, onClose }: { user: MockUser | null, isOpen: boolean, onClose: () => void }) => {
  const [role, setRole] = useState<UserRole | ''>(user?.role as UserRole || '');
  const [pin, setPin] = useState('');
  const { toast } = useToast();

  if (!user) return null;

  const handleSaveChanges = () => {
    toast({
      title: "Action requires backend",
      description: "Role management Cloud Function not yet implemented.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle>Edit User: {user.name}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="role-select" className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger id="role-select" className="h-12 text-lg">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Secretary">Secretary</SelectItem>
                <SelectItem value="Treasurer">Treasurer</SelectItem>
                <SelectItem value="Tanod">Tanod</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="pin-reset" className="text-sm font-medium">Reset PIN</label>
            <input id="pin-reset" type="password" placeholder="Enter new 4-digit PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full h-12 text-lg px-3 bg-zinc-950 border border-zinc-700 rounded-md" />
            <p className="text-xs text-zinc-400 mt-1">Leave blank to keep current PIN.</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const UsersAndRolesTab = () => {
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);

  return (
    <>
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-100">Staff Accounts</h2>
        <p className="text-sm text-zinc-400">Manage roles and access for barangay staff.</p>
        <div className="space-y-2">
          {mockUsers.map(user => (
            <div key={user.id} className="flex items-center p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <Avatar className="h-10 w-10 mr-4">
                <AvatarFallback>{user.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-zinc-100">{user.name}</p>
                <p className="text-sm text-zinc-400">{user.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-zinc-300">{user.role}</span>
                <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>Edit</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <EditUserModal isOpen={!!editingUser} user={editingUser} onClose={() => setEditingUser(null)} />
    </>
  );
};

const SystemTab = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!window.confirm("This will download all local data as CSV files in a zip archive. Continue?")) {
      return;
    }
    setIsExporting(true);
    try {
      await exportAllData();
      toast({
        title: "Export Complete",
        description: "Your data has been exported and should begin downloading shortly.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error.message || "An unexpected error occurred during export.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
        <h3 className="font-semibold">System Status</h3>
        <p className="text-sm text-zinc-400">View detailed logs, sync status, and module health.</p>
        <Link href="/status" passHref>
          <Button variant="outline" className="mt-3">View System Status Page</Button>
        </Link>
      </div>
    </div>
  );
};


export default function SettingsPage() { 
  return (
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-24">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          <p className="text-zinc-400 mt-1">Configure your BarangayOS terminal.</p>
          
          <Tabs defaultValue="profile" className="mt-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-lg">
              <TabsTrigger value="profile">Barangay Profile</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="users">Users & Roles</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <BarangayProfileTab />
            </TabsContent>
            <TabsContent value="devices" className="mt-6">
              <DeviceSettingsTab />
            </TabsContent>
            <TabsContent value="users" className="mt-6">
               <UsersAndRolesTab />
            </TabsContent>
             <TabsContent value="system" className="mt-6">
                <SystemTab />
             </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}
