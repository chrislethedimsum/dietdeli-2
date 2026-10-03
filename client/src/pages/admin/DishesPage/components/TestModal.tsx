import { Button } from "@heroui/react";
import CommonModal from "../../../components/common/CommonModal";
import { useState } from "react";

export default function TestModal() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onPress={() => setOpen(true)}>
                Open modal
            </Button>

            <CommonModal
                isOpen={open}
                onOpenChange={setOpen}
                title="Test Modal"
                footer={
                    <Button onPress={() => setOpen(false)}>
                        Đóng
                    </Button>
                }
            >
                <div>
                    Hello modal
                </div>
            </CommonModal>
        </>
    );
}