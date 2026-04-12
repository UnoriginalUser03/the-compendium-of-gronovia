import { Check, X } from "lucide-react";
import LeafletModal from "../LeafletModal";
import { DialogState } from "../LeafletTypes";

export default function LeafletLoadErrorModal({
    dialog,
    setDialog,
}: {
    dialog: DialogState;
    setDialog: (d: DialogState) => void;
}) {
    if (dialog.mode !== "load-error") return null;

    return (
        <LeafletModal
            title="Invalid File"
            description={
                <>
                    <strong style={{ color: "var(--ifm-color-danger)" }} className="text--center">This file is not a valid map data file.</strong>
                    <p>Error: {dialog.error ?? "Unknown error"}</p>
                </>
            }
            actions={[
                {
                    label: "Close",
                    icon: <X size={16} />,
                    variant: "danger",
                    onClick: () => setDialog({ mode: "closed" }),
                },
            ]}
            actionsMode="replace"
            actionsLayout="column"
            onCancel={() => setDialog({ mode: "closed" })}
        />
    );
}