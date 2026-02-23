import { createEffect, JSXElement, onCleanup, ParentProps } from "solid-js";
import { throttle } from "throttle-debounce";

import { useRefWithUtils } from "../../hooks/useRefWithUtils";
import { ElementWithUtils } from "../../utils/dom";
import { convertRemToPixels } from "../../utils/numbers";

export function AutoShrink(
  props: ParentProps & { class?: string },
): JSXElement {
  // Refs are assigned by SolidJS via the ref attribute
  const [ref, el] = useRefWithUtils<HTMLElement>();

  createEffect(() => {
    updateNameFontSize(el());
  });

  const throttledEvent = throttle(1000, () => {
    if (el()?.native.isConnected) {
      updateNameFontSize(el());
    }
  });

  window.addEventListener("resize", throttledEvent);

  onCleanup(() => {
    window.removeEventListener("resize", throttledEvent);
  });

  return (
    <div ref={ref} class={props.class}>
      {props.children}
    </div>
  );
}

export function updateNameFontSize(nameField?: ElementWithUtils): void {
  if (nameField === undefined) return;
  //dont run this function in safari because OH MY GOD IT IS SO SLOW
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) return;

  const nameFieldParent = nameField?.getParent();
  const upperLimit = convertRemToPixels(2);
  if (!nameFieldParent) return;

  nameField.native.style.fontSize = `10px`;
  const parentWidth = nameFieldParent.native.clientWidth;
  const widthAt10 = nameField.native.clientWidth;
  const ratioAt10 = parentWidth / widthAt10;
  const fittedFontSize = ratioAt10 * 10;
  const finalFontSize = Math.min(Math.max(fittedFontSize, 10), upperLimit);
  console.log("### new final", {
    parentWidth,
    widthAt10,
    ratioAt10,
    fittedFontSize,
    finalFontSize,
  });
  nameField.native.style.fontSize = `${finalFontSize}px`;
}
