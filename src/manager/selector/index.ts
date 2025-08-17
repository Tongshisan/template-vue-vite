import { getElementFullXPath } from "@/utils/dom";

const ignoreClassList = ["highlight-overlay", "selected-overlay"];

// 定义事件类型
export type SelectorEventType = "select" | "clear";
export type SelectorEventCallback = (
  selector: string,
  element?: HTMLElement,
) => void;

class SelectorManager {
  #xpath: string;
  #iframe: HTMLIFrameElement | null;
  #selectorCleanup: () => void;
  #currentOverlayInfo: {
    overlay: HTMLElement | null;
    targetElement: HTMLElement | null;
  };
  #selectedOverlayInfo: {
    overlay: HTMLElement | null;
    targetElement: HTMLElement | null;
    targetElementSelector: string;
  };
  #selector: string;
  #eventListeners: Map<SelectorEventType, SelectorEventCallback[]>;
  #isPaused: boolean;
  constructor() {
    this.#xpath = "";
    this.#iframe = null;
    this.#selectorCleanup = () => { };
    this.#currentOverlayInfo = {
      overlay: null,
      targetElement: null,
    };
    this.#selectedOverlayInfo = {
      overlay: null,
      targetElement: null,
      targetElementSelector: "",
    };
    this.#selector = "";
    this.#eventListeners = new Map();
    this.#isPaused = false;
  }

  get xpath() {
    return this.#xpath;
  }

  get iframe() {
    return this.#iframe;
  }

  get selector() {
    return this.#selector;
  }

  setIframe(iframe: HTMLIFrameElement | null) {
    this.#iframe = iframe;
    this.#setStyle();
  }

  // 添加事件监听器
  addEventListener(event: SelectorEventType, callback: SelectorEventCallback) {
    if (!this.#eventListeners.has(event)) {
      this.#eventListeners.set(event, []);
    }
    this.#eventListeners.get(event)?.push(callback);
  }

  // 移除事件监听器
  removeEventListener(
    event: SelectorEventType,
    callback: SelectorEventCallback,
  ) {
    const listeners = this.#eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // 触发事件
  #emitEvent(
    event: SelectorEventType,
    selector: string,
    element?: HTMLElement,
  ) {
    const listeners = this.#eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(selector, element));
    }
  }

  #updatePositions() {
    if (
      this.#currentOverlayInfo.overlay &&
      this.#currentOverlayInfo.targetElement
    ) {
      this.#updateOverlayPosition(
        this.#currentOverlayInfo.overlay,
        this.#currentOverlayInfo.targetElement,
      );
    }
    if (
      this.#selectedOverlayInfo.overlay &&
      this.#selectedOverlayInfo.targetElement
    ) {
      this.#updateOverlayPosition(
        this.#selectedOverlayInfo.overlay,
        this.#selectedOverlayInfo.targetElement,
      );
    }
  }

  #updateOverlayPosition(overlay: HTMLElement, targetElement: Element) {
    const rect = targetElement.getBoundingClientRect();
    const isSelected = overlay.classList.contains("selected-overlay");
    const width = isSelected ? rect.width + 2 : rect.width;
    const height = isSelected ? rect.height + 2 : rect.height;
    const newTop = isSelected ? rect.top - 1 : rect.top;
    const newLeft = isSelected ? rect.left - 1 : rect.left;
    overlay.style.width = `${width}px`;
    overlay.style.height = `${height}px`;
    overlay.style.top = `${newTop}px`;
    overlay.style.left = `${newLeft}px`;
  }

  open() {
    if (!this.#iframe) return () => { };
    const iframeDocument =
      this.#iframe.contentDocument || this.#iframe.contentWindow?.document;
    if (!iframeDocument) return () => { };
    const scrollHandler = () => {
      let isTracking = false;
      let rafId: number;
      let scrollTimeout: number;

      const _updatePositions = () => {
        this.#updatePositions();

        // 持续追踪滚动动画
        if (isTracking) {
          rafId = requestAnimationFrame(_updatePositions);
        }
      };

      return () => {
        if (!isTracking) {
          isTracking = true;
          rafId = requestAnimationFrame(_updatePositions);
        }

        // 使用 setTimeout 在滚动停止后结束追踪
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isTracking = false;
          cancelAnimationFrame(rafId);
        }, 100) as unknown as number;
      };
    };

    // 创建节流后的滚动处理函数
    const throttledScrollHandler = scrollHandler();
    // 监听 scroll 事件
    iframeDocument.addEventListener("scroll", throttledScrollHandler);
    function getElementIgnoringCertainClasses(
      x: number,
      y: number,
      ignoredClasses: string[],
    ): Element | null {
      if (!iframeDocument) return null;
      let element = iframeDocument.elementFromPoint(x, y) as HTMLElement;
      while (
        element &&
        ignoredClasses.some((cls) => element.classList.contains(cls))
      ) {
        element.style.pointerEvents = "none"; // Temporarily disable pointer events
        element = iframeDocument.elementFromPoint(x, y) as HTMLElement;
        element.style.pointerEvents = ""; // Re-enable pointer events
      }
      return element;
    }
    const mousemoveHandler = (e: MouseEvent) => {
      if (this.#isPaused) return;
      const previousOverlay =
        iframeDocument.querySelector(".highlight-overlay");
      if (previousOverlay) {
        previousOverlay.remove();
      }

      let element = getElementIgnoringCertainClasses(
        e.clientX,
        e.clientY,
        ignoreClassList,
      );
      while (element && element.nodeType !== 1) {
        element = element.parentElement;
      }
      if (element) {
        const createOverlay = () => {
          const overlay = iframeDocument.createElement("div");
          overlay.className = "highlight-overlay";
          iframeDocument.body.appendChild(overlay);
          return overlay;
        };

        // 创建并初始化 overlay
        const overlay = createOverlay();
        this.#currentOverlayInfo.overlay = overlay;
        this.#currentOverlayInfo.targetElement = element as HTMLElement;
        this.#updateOverlayPosition(overlay, element);
      }
    };

    // 将 mousedownHandler 移到外部，只绑定一次
    const mousedownHandler = (e: MouseEvent) => {
      if (this.#isPaused) return;
      e.preventDefault();
      e.stopPropagation();
      const previousSelectedOverlays =
        iframeDocument.querySelectorAll(".selected-overlay");

      if (previousSelectedOverlays) {
        previousSelectedOverlays.forEach((item) => {
          // item.classList.remove('selected-overlay');
          // 判断是不是当前选中的元素
          if (item === this.#currentOverlayInfo.overlay) {
            return;
          }
          item.remove();
        });
      }

      if (
        this.#currentOverlayInfo.overlay &&
        this.#currentOverlayInfo.targetElement
      ) {
        this.#currentOverlayInfo.overlay.classList.remove("highlight-overlay");
        this.#currentOverlayInfo.overlay.classList.add("selected-overlay");
        this.#selectedOverlayInfo.overlay = this.#currentOverlayInfo.overlay;
        this.#selectedOverlayInfo.targetElement =
          this.#currentOverlayInfo.targetElement;

        // 使用 selector 来表示
        // const selector = getElementPath(currentOverlayInfo.value.targetElement, iframeDocument);
        // 使用 fullXPath 来表示
        const fullXPath = getElementFullXPath(
          this.#currentOverlayInfo.targetElement,
        );
        // 使用 outerHTML 来表示
        this.#selectedOverlayInfo.targetElementSelector = fullXPath;
        this.#selector = fullXPath;

        // 触发选择事件，通知调用者
        this.#emitEvent(
          "select",
          this.#selector,
          this.#currentOverlayInfo.targetElement,
        );

      }
    };

    iframeDocument.addEventListener("mousemove", mousemoveHandler);
    iframeDocument.addEventListener("mousedown", mousedownHandler, true);

    // 添加鼠标移出事件处理函数
    const mouseoutHandler = () => {
      const previousOverlay =
        iframeDocument.querySelector(".highlight-overlay");
      if (previousOverlay) {
        previousOverlay.remove();
      }
    };
    this.#iframe.addEventListener("mouseout", mouseoutHandler);
    // cleanUp
    return () => {
      if (!iframeDocument) return;
      // 清除现有的overlay
      const selectedOverlays =
        iframeDocument.querySelectorAll(".selected-overlay");
      const highlightOverlays =
        iframeDocument.querySelectorAll(".highlight-overlay");
      if (selectedOverlays) {
        selectedOverlays.forEach((item) => {
          item.remove();
        });
      }
      if (highlightOverlays) {
        highlightOverlays.forEach((item) => {
          item.remove();
        });
      }
      iframeDocument.removeEventListener("mousemove", mousemoveHandler);
      iframeDocument.removeEventListener("scroll", throttledScrollHandler);
      iframeDocument.removeEventListener(
        "mousedown",
        mousedownHandler,
        true,
      );
      iframeDocument.removeEventListener("scroll", throttledScrollHandler);
      // 触发清除事件
      this.#emitEvent("clear", "");
    };
  }

  public openSelector() {
    this.#selectorCleanup = this.open();
  }

  public closeSelector() {
    this.#selectorCleanup();
    this.#selectorCleanup = () => { };
    this.#currentOverlayInfo = {
      overlay: null,
      targetElement: null,
    };
    this.#selectedOverlayInfo = {
      overlay: null,
      targetElement: null,
      targetElementSelector: "",
    };
    this.#selector = "";
    this.#isPaused = false;
  }

  public pauseSelector() {
    this.#isPaused = true;
  }

  public resumeSelector() {
    this.#isPaused = false;
  }

  #setStyle = () => {
    if (!this.#iframe) return;
    const iframeDocument =
      this.#iframe.contentDocument || this.#iframe.contentWindow?.document;
    if (!iframeDocument) return;
    const styleId = "highlight-overlay-style";
    const existingStyle = iframeDocument.getElementById(styleId);
    if (existingStyle) return;
    const style = document.createElement("style");
    style.textContent = `
      .highlight-overlay {
        z-index: 2147483646;
        position: fixed;
        background-color: rgba(102, 99, 255, 0.5); 
        pointer-events: all; /* 改为 auto 以允许点击 */
      }
      .selected-overlay {
        z-index: 2147483646;
        position: fixed;
        border: 2px dashed #6663FF;
        pointer-events: all; /* 防止选中父元素后不能在选择子元素 */
      }
    `;
    style.id = styleId;
    iframeDocument.head.appendChild(style);
  };
}

export const selectorManager = new SelectorManager();
