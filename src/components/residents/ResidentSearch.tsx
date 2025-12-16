
"use client";

import { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { residentConverter, type Resident as ResidentSchema } from '@/lib/firebase/schema';

interface ResidentSearchProps {
  children: (props: {
    residents: ResidentSchema[];
    loading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
  }) => React.ReactNode;
}

export const ResidentSearch = ({ children }: ResidentSearchProps) => {
  const [allResidents, setAllResidents] = useState<ResidentSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const residentsRef = collection(db, 'residents').withConverter(residentConverter);
    const q = query(residentsRef, orderBy('displayName'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const residentsData: ResidentSchema[] = [];
      querySnapshot.forEach((doc) => {
        residentsData.push(doc.data());
      });
      setAllResidents(residentsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching residents for picker: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredResidents = useMemo(() => {
    if (!searchTerm) return allResidents.slice(0, 10); // Show first 10 by default
    return allResidents.filter(resident =>
      resident.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.rbiId.includes(searchTerm)
    ).slice(0, 10); // Limit results for performance
  }, [searchTerm, allResidents]);

  return children({
    residents: filteredResidents,
    loading,
    searchTerm,
    setSearchTerm,
  });
};
