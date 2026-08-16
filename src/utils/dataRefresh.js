import { useEffect } from 'react';

export const DATA_REFRESH_EVENT = 'app:data-refresh';

export const triggerDataRefresh = (scope = 'all') => {
    if (typeof window === 'undefined') return;

    window.dispatchEvent(
        new CustomEvent(DATA_REFRESH_EVENT, {
            detail: { scope, timestamp: Date.now() }
        })
    );
};

export const useDataRefresh = (callback, scope = 'all') => {
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const handleRefresh = (event) => {
            const eventScope = event?.detail?.scope;
            const shouldRefresh = scope === 'all' || eventScope === 'all' || eventScope === scope;

            if (shouldRefresh) {
                callback();
            }
        };

        window.addEventListener(DATA_REFRESH_EVENT, handleRefresh);
        return () => window.removeEventListener(DATA_REFRESH_EVENT, handleRefresh);
    }, [callback, scope]);
};
