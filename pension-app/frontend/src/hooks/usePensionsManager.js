// src/hooks/usePensionsManager.js

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce, useLocalStorage } from "./useLocalStorage";
import { API_BASE, DEBOUNCE_DELAY } from "../utils/constants";
import { formatCurrency } from "../utils/helpers";

export function usePensionsManager(addToast) {
    // Core Data State
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [globalError, setGlobalError] = useState("");

    // Filtering & Sorting State
    const [filters, setFilters] = useState({ query: '', status: [], amountMin: '', amountMax: '', dateStart: '', dateEnd: '' });
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useLocalStorage('pension-pagesize', 10);

    const debouncedQuery = useDebounce(filters.query, DEBOUNCE_DELAY);

    // ===== API Function =====
    const fetchPensions = useCallback(async () => {
        setLoading(true);
        setGlobalError("");
        try {
            const res = await fetch(`${API_BASE}/pensions`);
            if (!res.ok) throw new Error(`Server responded with ${res.status}`);
            const data = await res.json();
            const normalized = (Array.isArray(data) ? data : []).map((d) => ({
                id: d.id ?? d.ID ?? "",
                recipientName: d.recipientName ?? d.RecipientName ?? "",
                amount: Number(d.amount ?? d.Amount ?? 0),
                status: d.status ?? d.Status ?? "Active",
                lastUpdated: d.lastUpdated ?? d.LastUpdated ?? "",
            }));
            setItems(normalized);
        } catch (e) {
            console.error(e);
            const errorMsg = e.message.includes("Failed to fetch")
                ? "Cannot connect to the backend server. Please ensure it's running."
                : e.message;
            setGlobalError(errorMsg);
            if (addToast) addToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);
    
    // Initial data fetch
    useEffect(() => {
        fetchPensions();
    }, [fetchPensions]);

    // Reset page to 1 when filters or page size change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedQuery, filters.status, filters.amountMin, filters.amountMax, filters.dateStart, filters.dateEnd, pageSize]);


    // ===== Memos & Derived Data =====
    const filteredAndSortedItems = useMemo(() => {
        let filtered = [...items];

        if (debouncedQuery) {
            const q = debouncedQuery.toLowerCase();
            filtered = filtered.filter(x =>
                x.id.toLowerCase().includes(q) ||
                x.recipientName.toLowerCase().includes(q) ||
                x.status.toLowerCase().includes(q)
            );
        }
        if (filters.status.length > 0) {
            filtered = filtered.filter(x => filters.status.includes(x.status));
        }
        if (filters.amountMin) {
            filtered = filtered.filter(x => x.amount >= Number(filters.amountMin));
        }
        if (filters.amountMax) {
            filtered = filtered.filter(x => x.amount <= Number(filters.amountMax));
        }
        if (filters.dateStart) {
            filtered = filtered.filter(x => new Date(x.lastUpdated) >= new Date(filters.dateStart));
        }
        if (filters.dateEnd) {
            filtered = filtered.filter(x => new Date(x.lastUpdated) <= new Date(filters.dateEnd));
        }

        filtered.sort((a, b) => {
            const dir = sortConfig.direction === 'asc' ? 1 : -1;
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];
            if (typeof aVal === 'number' && typeof bVal === 'number') return (aVal - bVal) * dir;
            return String(aVal).localeCompare(String(bVal)) * dir;
        });

        return filtered;
    }, [items, debouncedQuery, filters, sortConfig]);

    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredAndSortedItems.slice(startIndex, startIndex + pageSize);
    }, [filteredAndSortedItems, currentPage, pageSize]);

    const pageCount = useMemo(() => Math.ceil(filteredAndSortedItems.length / pageSize), [filteredAndSortedItems.length, pageSize]);

    const kpiData = useMemo(() => {
        const totalFund = items.reduce((sum, item) => sum + item.amount, 0);
        const statusCounts = items.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {});
        return {
            total: items.length,
            active: statusCounts.Active || 0,
            retired: statusCounts.Retired || 0,
            suspended: statusCounts.Suspended || 0,
            deceased: statusCounts.Deceased || 0,
            totalFund: formatCurrency(totalFund)
        };
    }, [items]);

    // ===== Handlers =====
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'status') {
            setFilters(prev => ({
                ...prev,
                status: checked ? [...prev.status, value] : prev.status.filter(s => s !== value)
            }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    const clearFilters = () => {
        setFilters({ query: '', status: [], amountMin: '', amountMax: '', dateStart: '', dateEnd: '' });
    };

    return {
        items,
        loading,
        globalError,
        filters,
        sortConfig,
        currentPage,
        pageSize,
        filteredAndSortedItems,
        paginatedItems,
        pageCount,
        kpiData,
        fetchPensions,
        handleSort,
        handleFilterChange,
        clearFilters,
        setCurrentPage,
        setPageSize
    };
}