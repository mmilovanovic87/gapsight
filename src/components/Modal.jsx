/**
 * Reusable modal dialog wrapper with overlay backdrop.
 * @param {{ children: React.ReactNode, onClose: () => void, labelId?: string }} props
 */
export default function Modal({ children, onClose, labelId }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6"
      >
        {children}
      </div>
    </div>
  );
}
