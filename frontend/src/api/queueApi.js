import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/api/v1/queue`;

export const fetchQueue = async () => {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error('Failed to fetch queue');
    return res.json();
};

export const checkInPatient = async (patientName) => {
    const res = await fetch(`${BASE_URL}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName }),
    });
    if (!res.ok) throw new Error('Check-In failed');
    return res.json();
};

export const callNextPatient = async () => {
    const res = await fetch(`${BASE_URL}/call-next`, { method: 'POST' });
    if (res.status === 204) return null;
    if (!res.ok) throw new Error('Call next failed');
    return res.json();
};

export const markDone = async (id) => {
    const res = await fetch(`${BASE_URL}/${id}/done`, { method: 'POST' });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Mark done failed');
    }
    return res.json();
};

export const markNoShow = async (id) => {
    const res = await fetch(`${BASE_URL}/${id}/no-show`, { method: 'POST' });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Mark no-show failed');
    }
    return res.json();
};

export const fetchStats = async () => {
    const res = await fetch(`${BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};