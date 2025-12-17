import React, { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmDisabled?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title = 'Confirm action',
    message = 'Are you sure?',
    confirmText = 'Delete',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    confirmDisabled = false,
}) => {
    if (!open) return null;
    const cancelRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleKey);
        // Focus the cancel button for accessibility
        setTimeout(() => cancelRef.current?.focus(), 0);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 z-10">
                <div className="flex items-start gap-4">
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{message}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        ref={cancelRef}
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
