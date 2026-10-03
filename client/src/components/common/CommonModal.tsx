import type { ReactNode } from "react";
import { Modal } from "@heroui/react";

type CommonModalProps = {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;

    title: string;
    description?: string;

    children: ReactNode;
    footer?: ReactNode;

    size?: "xs" | "sm" | "md" | "lg" | "cover" | "full";
};

export default function CommonModal({ isOpen, onOpenChange, title, description, children, footer, size = "md" }: CommonModalProps) {
    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container size={size} className="p-4">
                <Modal.Dialog className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <Modal.CloseTrigger />

                    <Modal.Header className="border-b border-gray-100 px-6 py-5">
                        <div>
                            <Modal.Heading className="text-lg font-semibold text-gray-900">{title}</Modal.Heading>

                            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                        </div>
                    </Modal.Header>

                    <Modal.Body className="px-6 py-5">{children}</Modal.Body>

                    {footer && <Modal.Footer className="border-t border-gray-100 px-6 py-4">{footer}</Modal.Footer>}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
