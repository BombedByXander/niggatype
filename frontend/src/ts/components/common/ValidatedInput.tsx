import { JSXElement, onMount } from "solid-js";

import {
  ValidatedHtmlInputElement,
  ValidationOptions,
} from "../../elements/input-validation";
import { useRefWithUtils } from "../../hooks/useRefWithUtils";

export function ValidatedInput<T = string>(
  props: ValidationOptions<T> & {
    value?: string;
    placeholder?: string;
  },
): JSXElement {
  // Refs are assigned by SolidJS via the ref attribute
  const [inputRef, inputEl] = useRefWithUtils<HTMLInputElement>();

  let _validatedInput: ValidatedHtmlInputElement | undefined;

  onMount(() => {
    // oxlint-disable-next-line typescript/no-non-null-assertion
    _validatedInput = new ValidatedHtmlInputElement(inputEl()!, {
      ...props,
    });
  });
  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={props.placeholder}
      value={props.value ?? ""}
    />
  );
}
