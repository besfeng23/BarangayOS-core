
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShieldAlert, Upload, KeyRound, Download, Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/context/SettingsContext';

// Mock data, in a real app this would come from an auth context and Firestore
const mockUser = {
    role: 'Admin' // Can be 'Admin', 'Secretary', 'Viewer'
};

const mockUsers = [
    { id: 'usr_1', name: 'Maria Santos', role: 'Secretary', lastLogin: '2024-07-28 10:15 AM' },
    { id: 'usr_2', name: 'Pedro Penduko', role: 'Admin', lastLogin: '2024-07-28 09:00 AM' },
    { id: 'usr_3', name: 'Ana Reyes', role: 'Viewer', lastLogin: '2024-07-27 02:30 PM' },
];

const SettingsPage = () => {
    const { toast } = useToast();
    const { settings, updateSettings, loading: settingsLoading } = useSettings();
    
    // Form state
    const [barangayName, setBarangayName] = useState('');
    const [lguAddress, setLguAddress] = useState('');
    const [captainName, setCaptainName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setBarangayName(settings.barangayName || '');
            setLguAddress(settings.municipality + ', ' + settings.province); // Combine for display
            setCaptainName(settings.punongBarangay || '');
        }
    }, [settings]);
    
    const userRole = mockUser.role;

    if (userRole !== 'Admin') {
        return (
            <div className="flex items-center justify-center h-full">
                <Alert variant="destructive" className="max-w-md">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Permission Denied</AlertTitle>
                    <AlertDescription>
                        You do not have the required permissions to view this page. Please contact your system administrator.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }
    
    const handleSaveIdentity = async () => {
        setIsSaving(true);
        try {
            const [municipality, province] = lguAddress.split(',').map(s => s.trim());
            await updateSettings({
                barangayName,
                punongBarangay: captainName,
                municipality: municipality || '',
                province: province || '',
            });
            toast({ title: 'Settings Saved', description: 'Print identity has been updated.' });
        } catch (e) {
            console.error(e);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not update settings.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleExport = () => {
        toast({ title: 'Exporting Data...', description: 'A ZIP file with all records will be downloaded shortly.' });
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">System Settings</h1>
                <p className="text-slate-400">Manage terminal configuration and user roles.</p>
            </div>

            <Tabs defaultValue="identity">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="identity">Print & Identity</TabsTrigger>
                    <TabsTrigger value="roles">Operator Management</TabsTrigger>
                    <TabsTrigger value="audit">Data & Audit</TabsTrigger>
                </TabsList>
                
                <TabsContent value="identity" className="mt-6">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle>Print & Identity Configuration</CardTitle>
                            <CardDescription>Set the global variables for all official printed documents.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {settingsLoading ? (
                                <div className="flex items-center justify-center h-48">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="barangayName" className="text-lg">Barangay Name (Full Legal)</Label>
                                            <Input id="barangayName" value={barangayName} onChange={e => setBarangayName(e.target.value)} className="h-12 text-lg bg-slate-900 border-slate-600" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lguAddress" className="text-lg">LGU Address</Label>
                                            <Input id="lguAddress" value={lguAddress} onChange={e => setLguAddress(e.target.value)} placeholder="e.g. Mabalacat City, Pampanga" className="h-12 text-lg bg-slate-900 border-slate-600" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="captainName" className="text-lg">Punong Barangay Name</Label>
                                        <Input id="captainName" value={captainName} onChange={e => setCaptainName(e.target.value)} className="h-12 text-lg bg-slate-900 border-slate-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-lg">Barangay Seal</Label>
                                        <Button variant="outline" className="w-full h-24 border-dashed flex-col">
                                            <Upload className="h-8 w-8 text-slate-400 mb-1" />
                                            <span>Upload Seal (PNG/JPEG)</span>
                                        </Button>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button onClick={handleSaveIdentity} className="h-12 text-lg" disabled={isSaving}>
                                            {isSaving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                            Save Identity Settings
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roles" className="mt-6">
                     <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle>Operator & Role Management</CardTitle>
                            <CardDescription>Manage user access and roles for this terminal.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-700 hover:bg-slate-800/50">
                                        <TableHead>User Name</TableHead>
                                        <TableHead>Current Role</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockUsers.map(user => (
                                        <TableRow key={user.id} className="border-slate-800">
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell><Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                            <TableCell>{user.lastLogin}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm">Change Role</Button>
                                                <Button variant="secondary" size="sm">Reset PIN</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audit" className="mt-6">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle>Audit & Data Export</CardTitle>
                            <CardDescription>Compliance tools for data management.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert className="border-yellow-500/50 text-yellow-400">
                                <Bot className="h-4 w-4 !text-yellow-400" />
                                <AlertTitle>TRIAL MODE</AlertTitle>
                                <AlertDescription>
                                    This terminal is in trial mode and will expire in 23 days. Please activate to ensure continued service.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label htmlFor="activationKey" className="text-lg">Activation Key</Label>
                                <div className="flex gap-2">
                                    <Input id="activationKey" placeholder="Enter your activation key..." className="h-12 text-lg bg-slate-900 border-slate-600" />
                                    <Button className="h-12 text-lg bg-green-600 hover:bg-green-700">
                                        <KeyRound className="mr-2 h-5 w-5" />
                                        Activate Terminal
                                    </Button>
                                </div>
                            </div>
                            
                            <Separator className="my-6 bg-slate-700"/>

                            <div>
                                <h3 className="text-lg font-semibold">Data Export</h3>
                                <p className="text-sm text-slate-400 mb-4">Generates a ZIP file containing CSV exports of all major records. For audit and backup purposes.</p>
                                <Button variant="destructive" className="h-12 text-lg" onClick={handleExport}>
                                    <Download className="mr-2 h-5 w-5" />
                                    Export All Data (CSV)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsPage;
