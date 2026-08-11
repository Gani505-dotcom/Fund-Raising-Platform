import { type TextareaHTMLAttributes, forwardRef } from "react";
import { classNames } from "@/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...props },
  ref,
) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={classNames(
          "w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-900 transition-all duration-200",
          "border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          "resize-none",
          error && "border-error-500 focus:border-error-500 focus:ring-error-500/20",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-error-600 dark:text-error-400">{error}</p>}
    </div>
  );
});

export default Textarea;
