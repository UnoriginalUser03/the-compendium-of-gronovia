import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import styles from "./styles.module.css";

/* =========================
   TYPES
========================= */

type FieldBase = {
  name: string;
  placeholder?: string;
  defaultValue?: string | number;
  defaultChecked?: boolean;
  required?: boolean;
  description?: string;
  css?: {
    className?: string;
    style?: React.CSSProperties;
  };
};

type FieldValue = string | number | boolean;
type FormValues = Record<string, FieldValue>;

type Field =
  | (FieldBase & { type?: "text" })
  | (FieldBase & {
    type: "select";
    options: { label: string; value: string }[];
  })
  | (FieldBase & {
    type: "textarea";
    rows?: number;
    cols?: number;
  })
  | (FieldBase & { type: "checkbox" });

type ModalAction = {
  label?: string;
  icon?: React.ReactNode;

  variant?: "primary" | "secondary" | "danger" | "ghost";

  onClick?: (values: FormValues) => void | Promise<void>;

  closeOnClick?: boolean;

  disabled?: boolean | ((values: FormValues) => boolean);

  /** ✅ NEW (minimal addition) */
  respectsValidation?: boolean;

  style?: React.CSSProperties;

  role?: "confirm" | "cancel" | "custom";
};

type ActionsLayout = "row" | "column";
type ActionsMode = "default" | "merge" | "replace";

/* =========================
   COMPONENT
========================= */

export default function LeafletModal({
  title,
  fields = [],
  customFields,
  actions,
  actionsLayout = "row",
  actionsMode = "default",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: {
  title: string;
  fields?: Field[];
  customFields?: React.ReactNode;

  actions?: ModalAction[];
  actionsLayout?: ActionsLayout;
  actionsMode?: ActionsMode;

  confirmLabel?: string;
  cancelLabel?: string;

  onConfirm?: (values: FormValues) => void | Promise<void>;
  onCancel: () => void;
}) {
  const map = useMap();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const [values, setValues] = useState<FormValues>(() =>
    Object.fromEntries(
      fields.map((f) => {
        if (f.type === "checkbox") {
          return [f.name, f.defaultChecked ?? false];
        }
        return [f.name, f.defaultValue ?? ""];
      })
    ) as FormValues
  );
  

  useEffect(() => {
    setContainer(map.getContainer());
  }, [map]);

  const isValid = fields.every((f) => {
    if (!f.required) return true;

    const value = values[f.name];

    if (typeof value === "boolean") return value === true;
    if (typeof value === "number") return true;

    return String(value ?? "").trim().length > 0;
  });

  if (!container) return null;

  /* =========================
     DEFAULT ACTIONS
  ========================= */

  const defaultActions: ModalAction[] = [
    {
      role: "cancel",
      label: cancelLabel,
      variant: "secondary",
      onClick: onCancel,
      closeOnClick: true,
    },
    {
      role: "confirm",
      label: confirmLabel,
      variant: "primary",
      onClick: onConfirm ? (values) => onConfirm(values) : undefined,
      closeOnClick: true,

      /** ✅ KEY CHANGE */
      respectsValidation: true,

      disabled: !onConfirm || !isValid,
    },
  ];

  /* =========================
     RESOLVE ACTIONS
  ========================= */

  const resolvedActions: ModalAction[] = (() => {
    if (actionsMode === "replace") {
      return actions ?? [];
    }

    if (actionsMode === "default" || !actions?.length) {
      return defaultActions;
    }

    const overrides = new Map(
      actions.filter((a) => a.role).map((a) => [a.role, a])
    );

    const merged = defaultActions.map((base) => {
      const override = base.role ? overrides.get(base.role) : undefined;

      if (!override) return base;

      return {
        ...base,
        ...override,
        role: base.role,
      };
    });

    const extras = actions.filter((a) => !a.role);

    return [...merged, ...extras];
  })();

  /* =========================
     RENDER
  ========================= */

  return createPortal(
    <>
      <div className={styles.backdrop} onClick={onCancel} />

      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>

        {/* FIELDS */}
        {customFields ?? (
          <>
            {fields.map((field) => (
              <div key={field.name} className={styles.field}>
                {(() => {
                  switch (field.type) {
                    case "select":
                      return (
                        <select
                          className="select"
                          value={String(values[field.name] ?? "")}
                          onChange={(e) =>
                            setValues((p) => ({
                              ...p,
                              [field.name]: e.target.value,
                            }))
                          }
                          style={field.css?.style}
                        >
                          <option value="">Select...</option>
                          {field.options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      );

                    case "textarea":
                      return (
                        <textarea
                          className="input"
                          value={String(values[field.name] ?? "")}
                          onChange={(e) =>
                            setValues((p) => ({
                              ...p,
                              [field.name]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          rows={field.rows}
                          cols={field.cols}
                          style={field.css?.style}
                        />
                      );

                    case "checkbox":
                      return (
                        <div
                          className={styles.checkboxRow}
                          role="checkbox"
                          tabIndex={0}
                          aria-checked={Boolean(values[field.name])}
                          onClick={() =>
                            setValues((p) => ({
                              ...p,
                              [field.name]: !Boolean(p[field.name]),
                            }))
                          }
                          style={field.css?.style}
                        >
                          <div className={styles.checkboxLabel}>
                            {field.description ?? field.name}
                          </div>

                          <input
                            type="checkbox"
                            checked={Boolean(values[field.name])}
                            readOnly
                            className={styles.checkbox}
                          />
                        </div>
                      );

                    default:
                      return (
                        <input
                          className="input"
                          value={String(values[field.name] ?? "")}
                          onChange={(e) =>
                            setValues((p) => ({
                              ...p,
                              [field.name]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          style={field.css?.style}
                        />
                      );
                  }
                })()}
              </div>
            ))}
          </>
        )}

        {/* ACTIONS */}
        <div className={styles.actions} data-layout={actionsLayout}>
          {resolvedActions.map((action, idx) => {
            const disabled =
              typeof action.disabled === "function"
                ? action.disabled(values)
                : action.disabled;

            // ✅ NEW: validation-aware disabling (opt-in per action)
            const respectsValidation =
              (action as any).respectsValidation ?? action.role === "confirm";

            const validationDisabled = respectsValidation && !isValid;

            const finalDisabled = Boolean(disabled || validationDisabled);

            const variantClass =
              action.variant === "primary"
                ? "button button--primary button--sm"
                : action.variant === "danger"
                  ? "button button--danger button--sm"
                  : action.variant === "ghost"
                    ? "button button--link button--sm"
                    : "button button--secondary button--sm";

            return (
              <button
                key={idx}
                className={variantClass}
                disabled={finalDisabled}
                style={{
                  ...action.style,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: action.label && action.icon ? 6 : 0,
                  justifyContent: "center",
                }}
                onClick={async () => {
                  if (finalDisabled) return;

                  await action.onClick?.(values);

                  if (action.closeOnClick !== false) {
                    onCancel();
                  }
                }}
              >
                {action.icon && (
                  <span className={styles.buttonIcon}>
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </>,
    container
  );
}