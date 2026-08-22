// components/common/ConfirmModal.jsx

import "./ConfirmModal.css";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  icon,
}) => {
  if (!isOpen) return null;

  const defaultIcons = {
    danger: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.3 3.2 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.2a2 2 0 0 0-3.4 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),

    warning: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),

    logout: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M21 3v18" />
      </svg>
    ),

    info: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
        <line x1="12" y1="12" x2="12" y2="16" />
      </svg>
    ),
  };

  const modalIcon = icon || defaultIcons[variant] || defaultIcons.warning;

  return (
    <div
      className="confirm-modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div
        className={`confirm-modal confirm-modal--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
      >
        {/* Close */}
        <button
          type="button"
          className="confirm-modal__close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close modal"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Icon */}
        <div className="confirm-modal__icon">{modalIcon}</div>

        {/* Content */}
        <div className="confirm-modal__content">
          <h2 id="confirm-modal-title">{title}</h2>

          <p id="confirm-modal-description">{description}</p>
        </div>

        {/* Actions */}
        <div className="confirm-modal__actions">
          <button
            type="button"
            className="confirm-modal__button confirm-modal__button--cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className={`confirm-modal__button confirm-modal__button--confirm confirm-modal__button--${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="confirm-modal__spinner" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
