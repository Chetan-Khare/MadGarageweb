import { useEffect, useRef } from 'react';
import { webSocketService } from '../services/webSocketService';
import { useAuth } from '../context/AuthContext';

export const usePartRequestUpdates = (onUpdate: (update: any) => void) => {
    const { role } = useAuth();
    const onUpdateRef = useRef(onUpdate);
    onUpdateRef.current = onUpdate;

    useEffect(() => {
        // Only Admins and Workers manage part requests
        if (role !== 'ROLE_ADMIN' && role !== 'ROLE_WORKER') return;

        const topic = '/topic/admin/part-requests';
        console.log(`[WS] Subscribing to part requests feed: ${topic}`);

        const unsubscribe = webSocketService.subscribe(topic, (updateMessage) => {
            console.log(`[WS] Received part request update:`, updateMessage);
            onUpdateRef.current(updateMessage);
        });

        return () => {
            unsubscribe();
        };
    }, [role]);
};
