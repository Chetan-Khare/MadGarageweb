import { useEffect, useRef } from 'react';
import { webSocketService } from '../services/webSocketService';
import { useAuth } from '../context/AuthContext';

export const useSellerOrderFeed = (onNewOrder: (order: any) => void) => {
  const { user } = useAuth();
  const onNewOrderRef = useRef(onNewOrder);
  onNewOrderRef.current = onNewOrder;

  useEffect(() => {
    // Only subscribe if user is a SELLER and has an ID
    if (!user || user.role !== 'ROLE_SELLER' || !user.id) return;

    const topic = `/topic/seller/${user.id}/orders/new`;
    console.log(`[WS] Subscribing to seller order feed: ${topic}`);
    
    const unsubscribe = webSocketService.subscribe(topic, (newOrder) => {
        console.log(`[WS] Received new order for seller:`, newOrder);
        onNewOrderRef.current(newOrder);
    });

    return () => {
        unsubscribe();
    };
  }, [user]);
};
