import React from "react";
import LeafletModal from "../LeafletModal";
import {
    DialogState,
    MarkerData,
    MarkerType,
    MarkerTypeGroups,
} from "../LeafletTypes";

import { Save, Trash2, Plus, X } from "lucide-react";

type Props = {
    dialog: DialogState;
    setDialog: (d: DialogState) => void;
    setUserMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>;
};

export default function LeafletMarkerEditorModal({
    dialog,
    setDialog,
    setUserMarkers,
}: Props) {
    if (!["create", "edit", "delete"].includes(dialog.mode)) return null;

    const isCreate = dialog.mode === "create";
    const isEdit = dialog.mode === "edit";
    const isDelete = dialog.mode === "delete";

    const marker =
        dialog.mode === "edit" || dialog.mode === "delete"
            ? dialog.marker
            : null;
    const position = dialog.mode === "create" ? dialog.position : null;

    return (
        <LeafletModal
            title={
                isCreate ? "Create Marker" : isEdit ? "Edit Marker" : "Delete Marker"
            }
            actionsLayout="row"
            actions={[
                {
                    role: "cancel",
                    label: "Cancel",
                    icon: <X size={16} />,
                    variant: "secondary",
                    onClick: () => setDialog({ mode: "closed" }),
                },

                ...(isDelete
                    ? [
                        {
                            label: "Delete",
                            icon: <Trash2 size={16} />,
                            variant: "danger" as const,
                            onClick: async () => {
                                if (!marker) return;

                                setUserMarkers((prev) =>
                                    prev.filter((m) => m.id !== marker.id)
                                );
                            },
                        },
                    ]
                    : []),

                ...(isCreate
                    ? [
                        {
                            label: "Create",
                            icon: <Plus size={16} />,
                            variant: "primary" as const,
                            respectsValidation: true,
                            onClick: async (values: any) => {
                                if (!position) return;

                                const typedType = values.type as MarkerType;

                                setUserMarkers((prev) => [
                                    ...prev,
                                    {
                                        id: crypto.randomUUID(),
                                        position,
                                        title: String(values.title),
                                        type: typedType,
                                        note: values.note ? String(values.note) : undefined,
                                        isUser: true,
                                        locked: Boolean(values.locked),
                                    },
                                ]);
                            },
                        },
                    ]
                    : []),

                ...(isEdit
                    ? [
                        {
                            label: "Save",
                            icon: <Save size={16} />,
                            variant: "primary" as const,
                            respectsValidation: true,
                            onClick: async (values: any) => {
                                if (!marker) return;

                                const typedType = values.type as MarkerType;

                                setUserMarkers((prev) =>
                                    prev.map((m) =>
                                        m.id === marker.id
                                            ? {
                                                ...m,
                                                title: String(values.title),
                                                type: typedType,
                                                note: values.note
                                                    ? String(values.note)
                                                    : undefined,
                                                locked: Boolean(values.locked),
                                            }
                                            : m
                                    )
                                );
                            },
                        },
                    ]
                    : []),
            ]}
            fields={
                isDelete
                    ? []
                    : [
                        {
                            name: "title",
                            type: "text",
                            required: true,
                            placeholder: "Marker name",
                            defaultValue: marker?.title ?? "",
                        },
                        {
                            name: "type",
                            type: "select",
                            required: true,
                            defaultValue: marker?.type ?? "",
                            options: Object.entries(MarkerTypeGroups.player).map(
                                ([key, v]) => ({
                                    value: key,
                                    label: v.label,
                                })
                            ),
                        },
                        {
                            name: "locked",
                            type: "checkbox",
                            defaultChecked: marker?.locked ?? false,
                            description: "Lock position",
                        },
                        {
                            name: "note",
                            type: "textarea",
                            placeholder: "Optional note...",
                            defaultValue: marker?.note ?? "",
                            rows: 4,
                            css: {
                                style: {
                                    resize: "vertical",
                                    minHeight: 80,
                                    maxHeight: 220,
                                },
                            },
                        },
                    ]
            }
            actionsMode="replace"
            customFields={
                isDelete ? (
                    <p style={{ margin: 0 }}>
                        Are you sure you want to delete <b>{marker?.title}</b>?
                    </p>
                ) : null
            }
            onCancel={() => setDialog({ mode: "closed" })}
        />
    );
}