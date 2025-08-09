/**
 * @description: 单击和多击事件处理
 * @return {*}
 */
export const singleAndMultipleClicksHandler = ({
  count,
  oneClickHandler,
  multiClickHandler,
}: {
  count: number;
  oneClickHandler: () => void;
  multiClickHandler: () => void;
}): (() => void) => {
  let clickCount = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  return () => {
    clickCount++;
    if (clickCount === 1) {
      timer = setTimeout(() => {
        oneClickHandler();
      }, 300);
    } else {
      if (clickCount === count) {
        multiClickHandler();
      }
      timer && clearTimeout(timer);
      timer = setTimeout(() => {
        clickCount = 0;
      }, 300);
    }
  };
};

export function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  (input.setSelectionRange(0, input.value.length),
    document.execCommand("Copy"));
  document.body.removeChild(input);
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
