
"use client";
import React, { useEffect, useState } from "react";
import { isReadOnly, useSettings } from "@/lib/bos/settings/useSettings";
import { useToast } from "@/components/ui/toast";
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
            <Label htmlFor="role-select">Role</Label>
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
            <Label htmlFor="pin-reset">Reset PIN</Label>
            <Input id="pin-reset" type="password" placeholder="Enter new 4-digit PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="h-12 text-lg" />
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


const BarangayProfileTab = () => {
  const { settings, save, saving, loading } = useSettings();
  const { toast } = useToast();
  const [form, setForm] = useState(settings);

  useEffect(() => {
    if (!loading) {
      setForm(settings);
    }
  }, [settings, loading]);

  const readOnly = isReadOnly(settings);

  const handleSave = async () => {
    const trimmedForm = {
      ...form,
      barangayName: form.barangayName.trim(),
      barangayAddress: form.barangayAddress.trim(),
      punongBarangay: form.punongBarangay.trim(),
      secretaryName: form.secretaryName.trim(),
      trialDaysRemaining: Math.max(0, Math.min(365, form.trialDaysRemaining)),
      controlPrefix: (form.controlPrefix || "BRGY").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12)
    };
    
    await save(trimmedForm);
    toast({ title: "Settings saved (offline-safe)" });
  };

  if (loading) {
    return <div className="p-6 text-center text-zinc-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Barangay Name">
          <Input value={form.barangayName} onChange={(v: string) => setForm((p) => ({ ...p, barangayName: v }))} />
        </Field>
        <Field label="Barangay Address">
          <Input value={form.barangayAddress} onChange={(v: string) => setForm((p) => ({ ...p, barangayAddress: v }))} />
        </Field>
        <Field label="Punong Barangay">
          <Input value={form.punongBarangay} onChange={(v: string) => setForm((p) => ({ ...p, punongBarangay: v }))} />
        </Field>
        <Field label="Secretary Name">
          <Input value={form.secretaryName} onChange={(v: string) => setForm((p) => ({ ...p, secretaryName: v }))} />
        </Field>
        <Field label="Control Prefix" hint="For document IDs">
          <Input value={form.controlPrefix} onChange={(v: string) => setForm((p) => ({ ...p, controlPrefix: v }))} />
        </Field>
        <Field label="System Mode">
          <select
            className={baseInput}
            value={String(form.readOnlyMode)}
            onChange={(e) => setForm((p) => ({ ...p, readOnlyMode: e.target.value === "true" }))}
          >
            <option value="false">Full Access</option>
            <option value="true">Read-Only</option>
          </select>
        </Field>
        <Field label="Trial Account">
          <select
            className={baseInput}
            value={String(form.trialEnabled)}
            onChange={(e) => setForm((p) => ({ ...p, trialEnabled: e.target.value === "true" }))}
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </Field>
        <Field label="Days Remaining">
          <Input
            type="number"
            value={String(form.trialDaysRemaining)}
            onChange={(v: string) => setForm((p) => ({ ...p, trialDaysRemaining: Number(v || 0) }))}
            disabled={!form.trialEnabled}
          />
        </Field>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || readOnly}
        className="w-full mt-6 py-4 rounded-2xl bg-zinc-100 text-zinc-950 font-extrabold text-lg min-h-[48px] disabled:opacity-50
          focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
      {readOnly && <p className="text-center text-amber-400 text-xs mt-2">Read-only mode. Changes cannot be saved.</p>}
    </div>
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


export default function SettingsPage() { 
  return (
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-24">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
          <p className="text-zinc-400 mt-1">Configure your BarangayOS terminal.</p>
          
          <Tabs defaultValue="profile" className="mt-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="profile">Barangay Profile</TabsTrigger>
              <TabsTrigger value="users">Users & Roles</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <BarangayProfileTab />
            </TabsContent>
            <TabsContent value="users" className="mt-6">
               <UsersAndRolesTab />
            </TabsContent>
             <TabsContent value="system" className="mt-6">
                <Link href="/status" className="text-sm text-zinc-400 hover:text-zinc-100 underline">
                  View System Status & Logs
                </Link>
             </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}

const baseInput =
  "w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 min-h-[48px] disabled:opacity-50 disabled:bg-zinc-900/50 " +
  "focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-950";

function Field({ label, children, hint }: any) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-500 uppercase font-semibold ml-1">{label}</label>
       {hint && <p className="text-xs text-zinc-600 ml-1">{hint}</p>}
      {children}
    </div>
  );
}
function Input({ value, onChange, type = "text", ...props }: any) {
  return <input type={type} className={baseInput} value={value} onChange={(e) => onChange(e.target.value)} {...props} />;
}
