import { useState, useRef, useCallback } from 'react';
import apiClient, { BASE_SERVER_URL } from '../services/apiClient';

export interface ChatStreamResult {
    message: string;
    products?: any[];
}

export const useAIChatStream = () => {
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingText, setStreamingText] = useState('');
    
    // We use AbortController to allow cancelling an ongoing stream
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (
        text: string, 
        images: File[], 
        onComplete: (result: ChatStreamResult) => void,
        onError: (error: any) => void
    ) => {
        setIsStreaming(true);
        setStreamingText('');
        
        // If there are images, we fall back to the standard REST endpoint
        // since SSE doesn't handle multipart/form-data well without Base64 encoding
        if (images.length > 0) {
            try {
                const formData = new FormData();
                if (text) formData.append('message', text);
                images.forEach(img => formData.append('images', img));
                
                const res = await apiClient.post('/assistant/chat', formData);
                setIsStreaming(false);
                onComplete(res.data);
            } catch (err) {
                setIsStreaming(false);
                onError(err);
            }
            return;
        }

        // For text-only, we use SSE (Server-Sent Events) via fetch stream
        abortControllerRef.current = new AbortController();
        
        try {
            const params = new URLSearchParams();
            if (text) params.append('message', text);

            const response = await fetch(`${BASE_SERVER_URL}/api/assistant/chat/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
                signal: abortControllerRef.current.signal,
                credentials: 'include', // Sends the mg_auth HttpOnly cookie automatically
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.startsWith('data:')) {
                            const data = line.slice(5).trim();
                            if (data === '[DONE]') {
                                break;
                            }
                            const rawData = line.substring(5);
                            const textToken = rawData.startsWith(' ') ? rawData.substring(1) : rawData;
                            accumulatedText += textToken;
                            setStreamingText(accumulatedText);
                        }
                    }
                }
            }

            setIsStreaming(false);
            onComplete({ message: accumulatedText, products: [] });

        } catch (err: any) {
            if (err.name === 'AbortError') {
                console.log('Stream aborted');
            } else {
                setIsStreaming(false);
                onError(err);
            }
        }
    }, []);

    const stopStreaming = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsStreaming(false);
        }
    }, []);

    return {
        isStreaming,
        streamingText,
        sendMessage,
        stopStreaming
    };
};
