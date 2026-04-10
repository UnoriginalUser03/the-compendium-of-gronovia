import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import styles from "./styles.module.css";

type Field =
  | {
      name: string;
      placeholder?: string;
      defaultValue?: string;
      type?: "text";
      required?: boolean;
    }
  | {
      name: string;
      type: "select";
      defaultValue?: string;
      required?: boolean;
      options: { label: string; value: string }[];
    };

export default function LeafletModal({
  title,
  fields = [],
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  customFields,
}: {
  title: string;
  fields?: Field[];
  customFields?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (values: Record<string, string>) => void;
  onCancel: () => void;
}) {
  const map = useMap();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? ""]))
  );

  useEffect(() => {
    setContainer(map.getContainer());
  }, [map]);

  const isValid = fields.every((f) => {
    if (!f.required) return true;
    return values[f.name]?.trim()?.length > 0;
  });

  if (!container) return null;

  return createPortal(
    <>
      {/* BACKDROP */}
      <div className={styles.backdrop} onClick={onCancel} />

      {/* MODAL */}
      <div
        className={`card padding--md ${styles.modal}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TITLE */}
        <div className={styles.title}>{title}</div>

        {/* CONTENT */}
        {customFields ?? (
          <>
            {fields.map((field) => (
              <div key={field.name} className={styles.field}>
                {field.type === "select" ? (
                  <select
                    className="select"
                    value={values[field.name]}
                    onChange={(e) =>
                      setValues((p) => ({
                        ...p,
                        [field.name]: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select type</option>
                    {field.options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="input"
                    value={values[field.name]}
                    onChange={(e) =>
                      setValues((p) => ({
                        ...p,
                        [field.name]: e.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </>
        )}

        {/* ACTIONS */}
        <div className={styles.actions}>
          <button
            className="button button--secondary button--sm"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            className="button button--primary button--sm"
            disabled={!isValid}
            onClick={() => onConfirm(values)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>,
    container
  );
}