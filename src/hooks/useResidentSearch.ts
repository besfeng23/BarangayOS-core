
import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";
import { db, ResidentLocal } from "@/lib/bosDb";
import { norm } from "@/lib/uuid";

export function useResidentSearch(query: string, limit = 10) {
  const [results, setResults] = useState<ResidentLocal[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 250);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const normalizedQuery = norm(debouncedQuery);
        // Prioritize last name matches
        const byLastName = await db.residents
          .where("fullNameUpper")
          .startsWith(normalizedQuery.toUpperCase())
          .limit(limit)
          .toArray();

        // You could add more search strategies here if needed, like by household number
        // and merge the results. For now, this is a simple and fast approach.

        setResults(byLastName);
      } catch (error) {
        console.error("Error searching residents in Dexie:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery, limit]);

  return { results, loading };
}
