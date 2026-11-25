import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm'|'md'|'lg'|'xl';
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({ open, onClose, title, children, footer, size='md' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-mata-950/40 backdrop-blur-sm animate-fade-in" />
      {/* Panel */}
      <div
        className={`relative bg-white rounded-organic-xl shadow-organic-xl w-full ${SIZES[size]} animate-slide-up flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 border-b border-linho-200">
          <h2 className="font-display text-base sm:text-lg font-semibold text-mata-900 min-w-0 truncate">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-organic text-cedro-400 hover:bg-linho-100 hover:text-mata-700 transition-colors shrink-0">
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        {/* Footer */}
        {footer && <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-linho-200 flex flex-wrap justify-end gap-2 sm:gap-3">{footer}</div>}
      </div>
    </div>
  );
}

// Confirm dialog
interface ConfirmProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}
export function Confirm({ open, onClose, onConfirm, title, message, confirmLabel='Confirmar', danger }: ConfirmProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<>
        <Button variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
        <Button variant={danger?'danger':'primary'} size="sm" onClick={()=>{onConfirm();onClose();}}>{confirmLabel}</Button>
      </>}
    >
      <p className="text-sm text-cedro-600">{message}</p>
    </Modal>
  );
}
