import { useEffect, useRef, useState } from "react";
import { hasFieldErrors, type FieldErrors } from "../lib/field-validation";
import {
  focusFirstInvalidField,
  getValidationToastMessage,
} from "../lib/validation-error-navigation";

export function useSaveValidationFeedback() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [navigationAttempt, setNavigationAttempt] = useState(0);
  const fieldErrorsRef = useRef(fieldErrors);
  fieldErrorsRef.current = fieldErrors;

  useEffect(() => {
    if (navigationAttempt === 0) return;
    const errors = fieldErrorsRef.current;
    if (!hasFieldErrors(errors)) return;
    focusFirstInvalidField(errors);
  }, [navigationAttempt]);

  function reportFieldErrors(errors: FieldErrors): boolean {
    setFieldErrors(errors);
    if (!hasFieldErrors(errors)) return false;
    setNavigationAttempt((attempt) => attempt + 1);
    return true;
  }

  function clearFieldError(key: string) {
    setFieldErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function clearAllFieldErrors() {
    setFieldErrors({});
  }

  return {
    fieldErrors,
    toastMessage: getValidationToastMessage(fieldErrors),
    reportFieldErrors,
    clearFieldError,
    clearAllFieldErrors,
  };
}
