const NONE_EL_WHITELIST = ["SCRIPT", "STYLE"];

export const TEXT_EL_BLACKLIST = ["SCRIPT", "STYLE", "NOSCRIPT"];

export function isInput(n: Element): n is HTMLInputElement {
  return n.tagName === "INPUT";
}

export function isInputButton(n: Node | null): n is HTMLInputElement {
  return !!n && isElement(n) && isInput(n) && /button|submit/.test(n.type);
}

export function isTextNode(n: Node): n is Text {
  return n && n.nodeType === n.TEXT_NODE;
}
export function isOnlyTextElement(el: HTMLElement): el is HTMLElement {
  if (TEXT_EL_BLACKLIST.includes(el.tagName)) return false;
  const children: Node[] = [];
  el.childNodes.forEach((n) => {
    children.push(n);
  });
  return Boolean(
    children.length &&
      children.every((e) => {
        return e.nodeType === el.TEXT_NODE;
      }),
  );
}

// 如果函数未被使用，添加前缀 _ 来避免 ESLint 警告
function _isCanBeWalkedNode(n: Node): n is HTMLElement | Document {
  switch (n.nodeType) {
    case n.DOCUMENT_NODE:
      return true;
    case n.ELEMENT_NODE:
      return true;
    default:
      return false;
  }
}

export function isShadowRoot(n: Node): n is ShadowRoot {
  const host: Element | null = (n as ShadowRoot)?.host;
  return Boolean(host && host.shadowRoot && host.shadowRoot === n);
}

export function isElement(n: Node): n is Element {
  return n.nodeType === n.ELEMENT_NODE;
}

export function isIframeElement(n: Node): n is HTMLIFrameElement {
  return isElement(n) && n.tagName === "IFRAME";
}

export function isShadowHost(
  n: Node,
): n is Element & { shadowRoot: ShadowRoot } {
  return Boolean(isElement(n) && n.shadowRoot);
}
function isInWhitelist(el: HTMLElement) {
  if (el.parentElement?.tagName === "HEAD" || el.tagName === "HEAD")
    return true;
  return NONE_EL_WHITELIST.some((name) => name === el.tagName);
}

function isSlot(el: HTMLElement) {
  return el?.getAttribute("slot") || el?.assignedSlot;
}

export function isNoneEl(el: HTMLElement) {
  if (el?.offsetParent !== null) return false;
  if (isInWhitelist(el)) return false;
  if (isSlot(el)) return false;
  if (el?.style?.display === "none") return true;
  if (el?.style?.display === "contents") return false;
  const hasContent = el?.scrollHeight !== 0 || el?.scrollWidth !== 0;
  if (hasContent) return false;
  const displayStyle = window.getComputedStyle(el)?.display;
  return displayStyle === "none";
}

/**
 * @description: 获取元素的完整xpath
 * @param {Element} element
 * @return {*}
 */
export function getElementFullXPath(element: Element | null): string {
  let xpath = "";
  let currentElement: Element | null = element;

  while (currentElement) {
    const tagName = currentElement.tagName.toLowerCase();
    let index = 1;

    // 计算同级元素的索引
    let sibling = currentElement.previousElementSibling;
    while (sibling) {
      if (sibling.tagName.toLowerCase() === tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    // 获取同级相同标签的元素的元素数量
    const sameTagElements = Array.from(
      currentElement.parentElement?.children || [],
    ).filter((child) => child.tagName.toLowerCase() === tagName);

    // 根据标签类型决定是否显示索引
    if (sameTagElements.length > 1) {
      xpath = `/${tagName}[${index}]${xpath}`;
    } else {
      xpath = `/${tagName}${xpath}`;
    }

    // 移动到父元素
    currentElement = currentElement.parentElement;
  }

  return xpath;
}

export const checkDomHasEvent = async (
  element: HTMLElement,
  eventName: string,
): Promise<boolean> => {
  return new Promise((resolve) => {
    let hasEvent = false;
    const handler = () => {
      hasEvent = true;
    };
    element.addEventListener(eventName, handler, { once: true });
    setTimeout(() => {
      resolve(hasEvent);
    }, 300);
  });
};
