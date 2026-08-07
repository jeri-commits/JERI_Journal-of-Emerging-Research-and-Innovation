import React, { PropsWithChildren } from 'react'
import Modal from 'react-modal'
import classNames from 'classnames'
import CloseButton from '../CloseButton'

export interface DialogProps extends PropsWithChildren {
    isOpen: boolean
    onClose?: () => void
    onRequestClose?: () => void
    className?: string
    width?: number | string
}

const Dialog: React.FC<DialogProps> = ({
    isOpen,
    onClose,
    onRequestClose,
    children,
    className,
    width = 520,
}) => {
    const handleClose = () => {
        if (onClose) onClose()
        if (onRequestClose) onRequestClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={handleClose}
            ariaHideApp={false}
            className="outline-none max-w-lg w-full mx-auto"
            overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
            <div className={classNames('bg-canvas dark:bg-surface-dark border border-hairline-strong rounded-xl shadow-xl overflow-hidden relative w-full', className)}>
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-body hover:text-ink text-lg z-10"
                    type="button"
                >
                    <CloseButton onClick={handleClose} />
                </button>
                {children}
            </div>
        </Modal>
    )
}

export default Dialog
