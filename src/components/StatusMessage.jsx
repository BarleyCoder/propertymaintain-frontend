const StatusMessage = ({ type = 'info', message, onClose }) => {
    if (!message) return null;

    const styles = {
        success: 'border-green-200 bg-green-50 text-green-800',
        error: 'border-red-200 bg-red-50 text-red-800',
        info: 'border-blue-200 bg-blue-50 text-blue-800'
    };

    return (
        <div className={`rounded-lg border px-4 py-3 text-sm shadow-sm ${styles[type] || styles.info}`}>
            <div className="flex items-start justify-between gap-3">
                <span>{message}</span>
                {onClose && (
                    <button type="button" className="font-semibold opacity-80 hover:opacity-100" onClick={onClose}>
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

export default StatusMessage;
