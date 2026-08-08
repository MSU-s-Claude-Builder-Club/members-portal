import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Trash2, AlertTriangle, Save, X } from 'lucide-react';

interface EditModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    onSubmit: (e: React.FormEvent) => Promise<void> | void;
    onDelete?: () => Promise<void> | void;
    loading?: boolean;
    deleteItemName?: string;
    children: React.ReactNode;
    submitLabel?: string;
}

export const EditModal = ({
    open,
    onClose,
    title,
    description,
    onSubmit,
    onDelete,
    loading = false,
    deleteItemName,
    children,
    submitLabel,
}: EditModalProps) => {
    const isMobile = useIsMobile();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDelete = async () => {
        if (!onDelete) return;

        setDeleteLoading(true);
        try {
            await onDelete();
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(e);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent
                    className={`max-w-3xl gap-0 overflow-y-auto rounded-none border border-border p-0 shadow-[8px_8px_0_0_hsl(var(--foreground))] ${isMobile ? 'mx-4 max-w-[85vw] max-h-[85vh] overflow-x-hidden m-0' : 'max-h-[90vh]'}`}
                >
                    <DialogHeader className="hatch flex-shrink-0 space-y-1 border-b border-border px-6 py-4 text-left">
                        <DialogTitle className="font-mono text-lg font-extrabold tracking-[-0.02em]">{title}</DialogTitle>
                        {description && (
                            <DialogDescription className="font-mono text-xs text-muted-foreground">
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <form id="edit-modal-form" onSubmit={handleSubmit} className="space-y-4">
                            {children}
                        </form>
                    </div>

                    <div
                        className={`flex w-full flex-shrink-0 gap-2 border-t border-border bg-page px-6 py-4
                            ${isMobile ? 'flex-col' : 'flex-row'}
                        `}
                    >
                        {onDelete && (
                            <Button
                                type="button"
                                variant="red"
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={loading || deleteLoading}
                                className="w-full"
                            >
                                <Trash2 className="h-4 w-4 mr-0" />
                                Delete
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading || deleteLoading}
                            className="w-full"
                        >
                            <X className="h-4 w-4 mr-0" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form="edit-modal-form"
                            disabled={loading || deleteLoading}
                            className="w-full"
                        >
                            <Save className="h-4 w-4 mr-0" />
                            {loading ? 'Saving...' : submitLabel || 'Save'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {onDelete && (
                <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <AlertDialogContent className="rounded-none border border-border shadow-[8px_8px_0_0_hsl(var(--foreground))]">
                        <AlertDialogHeader>
                            <div className="flex w-full items-center justify-between">
                                <AlertDialogTitle className="text-left font-mono font-extrabold tracking-[-0.02em]">
                                    Delete {deleteItemName || 'Item'}
                                </AlertDialogTitle>
                                <div className="flex h-8 w-8 items-center justify-center bg-destructive text-destructive-foreground">
                                    <AlertTriangle className="h-5 w-5" />
                                </div>
                            </div>
                            <AlertDialogDescription className="mt-2 text-left">
                                Are you sure you want to delete this {deleteItemName?.toLowerCase() || 'item'}? This action
                                cannot be undone and will permanently remove all associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter
                            className={`flex !justify-around ${isMobile ? 'space-y-2 flex-col-reverse' : 'flex-row'}`}
                        >
                            <AlertDialogCancel
                                variant="outline"
                                disabled={deleteLoading}
                                className={isMobile ? '' : 'w-[47%] mt-0'}
                            >
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                variant="red"
                                className={!isMobile ? 'w-[47%]' : ''}
                            >
                                {deleteLoading ? 'Deleting...' : `Delete ${deleteItemName || 'Item'}`}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    );
};
