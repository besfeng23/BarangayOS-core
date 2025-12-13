
"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const requiredDocs = [
  { id: 'dti', label: 'DTI/SEC/CDA Registration' },
  { id: 'zoning', label: 'Zoning Clearance' },
  { id: 'fire', label: 'Fire Safety Certificate' },
  { id: 'sanitary', label: 'Sanitary Permit' },
];

const Step2Details = ({ formData, setFormData }: { formData: any, setFormData: any }) => {
    const handleSelectChange = (id: string, value: string) => {
        setFormData({ ...formData, [id]: value });
    };
    
    const handleCheckboxChange = (docId: string, checked: boolean) => {
        const currentDocs = formData.requirements || {};
        setFormData({ 
            ...formData, 
            requirements: { ...currentDocs, [docId]: checked }
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                 <div>
                    <Label htmlFor="permitType" className="text-lg">Permit Type</Label>
                    <Select onValueChange={(value) => handleSelectChange('permitType', value)} defaultValue={formData.permitType}>
                      <SelectTrigger className="h-12 text-lg bg-slate-900 border-slate-600 mt-1">
                        <SelectValue placeholder="Select application type..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 text-white border-slate-700">
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="RENEWAL">Renewal</SelectItem>
                        <SelectItem value="TRANSFER">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="businessNature" className="text-lg">Nature of Business</Label>
                     <Input id="businessNature" placeholder="e.g., Sari-Sari Store, Eatery, Services" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" onChange={(e) => setFormData({...formData, businessNature: e.target.value})} value={formData.businessNature || ''} />
                </div>
                 <div>
                    <Label htmlFor="applicationDate" className="text-lg">Application Date</Label>
                    <Input id="applicationDate" type="date" className="h-12 text-lg bg-slate-900 border-slate-600 mt-1" defaultValue={new Date().toISOString().substring(0,10)} onChange={(e) => setFormData({...formData, applicationDate: e.target.value})} />
                </div>
            </div>
            <div className="space-y-4">
                <Label className="text-lg">Required Documents</Label>
                <div className="p-4 bg-slate-900/50 rounded-md space-y-4">
                    {requiredDocs.map(doc => (
                        <div key={doc.id} className="flex items-center space-x-3">
                            <Checkbox 
                                id={doc.id} 
                                onCheckedChange={(checked) => handleCheckboxChange(doc.id, Boolean(checked))}
                                checked={formData.requirements ? formData.requirements[doc.id] : false}
                            />
                            <Label htmlFor={doc.id} className="text-base font-normal">
                                {doc.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Step2Details;
