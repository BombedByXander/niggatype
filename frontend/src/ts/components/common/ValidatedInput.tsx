import { createEffect, JSXElement, onMount } from "solid-js";

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

  createEffect(() => {
    validatedInput?.setValue(props.value ?? null);
  });

  let validatedInput: ValidatedHtmlInputElement | undefined;

  onMount(() => {
    // oxlint-disable-next-line typescript/no-non-null-assertion
    validatedInput = new ValidatedHtmlInputElement(inputEl()!, {
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

<div class="grid min-h-screen place-items-center">
  <div class="grid grid-cols-2 gap-4">
    <div class="col-span-2"></div>
    <div class="text-md flex gap-2"></div>
  </div>
</div>;
