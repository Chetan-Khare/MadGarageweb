import { useEffect, useRef } from 'react';
import { webSocketService } from '../services/webSocketService';
import { useAuth } from '../context/AuthContext';

/**
 * Subscribes to /topic/admin/partner-requests for real-time partner application events.
 * Only active for ROLE_ADMIN and ROLE_WORKER users.
 *
 * Message shape: { type: 'NEW' | 'STATUS_UPDATE', payload: { id, ...fields } }
 */
export const usePartnerRequestUpdates = (onUpdate: (update: any) => void) => {
    const { role } = useAuth();
    const onUpdateRef = useRef(onUpdate);
    onUpdateRef.current = onUpdate;

    useEffect(() => {
        if (role !== 'ROLE_ADMIN' && role !== 'ROLE_WORKER') return;

        const topic = '/topic/admin/partner-requests';
        console.log(`[WS] Subscribing to partner requests feed: ${topic}`);

        const unsubscribe = webSocketService.subscribe(topic, (message) => {
            console.log('[WS] Partner request update received:', message);
            onUpdateRef.current(message);
        });

        return () => {
            unsubscribe();
        };
    }, [role]);
};
