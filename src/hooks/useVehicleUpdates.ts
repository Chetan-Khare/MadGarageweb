import { useEffect, useRef } from 'react';
import { webSocketService } from '../services/webSocketService';
import { useAuth } from '../context/AuthContext';

export const useVehicleUpdates = (onUpdate: (update: any) => void) => {
    const { role } = useAuth();
    const onUpdateRef = useRef(onUpdate);
    onUpdateRef.current = onUpdate;

    useEffect(() => {
        // Only Admins manage vehicles
        if (role !== 'ROLE_ADMIN') return;

        const topic = '/topic/vehicles/updates';
        console.log(`[WS] Subscribing to vehicle updates feed: ${topic}`);

        const unsubscribe = webSocketService.subscribe(topic, (updateMessage) => {
            console.log(`[WS] Received vehicle update:`, updateMessage);
            onUpdateRef.current(updateMessage);
        });

        return () => {
            unsubscribe();
        };
    }, [role]);
};
