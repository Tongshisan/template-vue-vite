/**
 * @description: 空闲时执行
 * @param {function} fn
 * @return {*}
 */
export const idle = (fn: () => void) => {
  if ("scheduler" in window) {
    return (window as any).scheduler.postTask(fn, {
      priority: "background",
    });
  }
  if ("requestIdleCallback" in window) {
    return requestIdleCallback(fn, {
      timeout: 1000,
    });
  }
  setTimeout(fn, 0);
};

/**
 * 判断是否在 iframe 中
 * @returns {boolean} true表示在iframe中，false表示不在iframe中
 */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (e) {
    // 客户端导入时，会报错，这里直接返回false
    return false;
  }
}

/**
 * 判断是否在 Electron 环境中
 * @returns {boolean} true表示在 Electron 中，false表示不在
 */
function _isElectron(userAgent: string): boolean {
  const computer = /electron/i.test(userAgent);
  return !!computer;
}

/**
 * 判断是否在 Electron 环境中
 * @returns {boolean} true表示在 Electron 中，false表示不在
 */
export function isElectron(): boolean {
  return _isElectron(navigator.userAgent.toUpperCase()) && !isInIframe();
}

/**
 * 判断当前设备是否是 Mac 电脑
 * @returns {boolean} true 表示是 Mac 电脑，false 表示不是
 */
export function isMac(): boolean {
  const computer = /macintosh|mac os x/i.test(
    navigator.userAgent.toUpperCase(),
  );
  return !!computer;
}

/**
 * 判断当前设备操作系统是否是 Linux
 * @returns {boolean} true 表示是 Linux，false 表示不是
 */
export function isLinuxPlatform(): boolean {
  const computer = /linux/i.test(navigator.userAgent.toUpperCase());
  return !!computer;
}

/**
 * 判断当前设备是否是移动设备（包括 Android、iOS 和 BlackBerry）
 * @returns {boolean} true 表示是移动设备，false 表示不是
 */
export function isMobile(): boolean {
  const computer = /Android|webOS|iPhone|iPod|BlackBerry/i.test(
    navigator.userAgent,
  );
  return !!computer;
}

/**
 * 判断当前设备是否是 iPad
 * @returns {boolean} true 表示是 iPad，false 表示不是
 */
export function isIpad(): boolean {
  const computer =
    navigator.userAgent.match(/(iPad)/) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return !!computer;
}

/**
 * 判断当前是否处于 WebView 环境中
 * @returns {boolean} true 表示是 WebView 环境，false 表示不是
 */
export function isAndroidWebView(): boolean {
  // 钉钉和其他不一样
  return (
    /Android.+wv\)/.test(navigator.userAgent) ||
    /DingTalk/.test(navigator.userAgent)
  );
}

/**
 * 判断是否在TikTok内置浏览器中
 */
export function isTikTok(): boolean {
  return /BytedanceWebview|NewsArticle|TTWebView/i.test(navigator.userAgent);
}

/**
 * 判断Safari浏览器版本是否小于15
 */
export function safariVersionLowerThan15(): boolean {
  const info = platformInfo();
  if (!info.isSafari) return false;

  const version = info.safariVersion;
  const majorVersion = version?.split(".")[0];
  if (!majorVersion) return false;

  const formattedVersion = parseInt(majorVersion, 10);
  return formattedVersion < 15;
}

/**
 * 表示用户平台信息。
 */
interface PlatformInfo {
  isMac: boolean; // 是否是 Mac
  isWindows: boolean; // 是否是 Windows
  isiOS: boolean; // 是否是 iOS
  isChromeOS: boolean; // 是否是 Chrome OS
  isLinux: boolean; // 是否是 Linux
  isChrome: boolean; // 是否是 Chrome 浏览器
  isFirefox: boolean; // 是否是 Firefox 浏览器
  isEdge: boolean; // 是否是 Edge 浏览器
  isSafari: boolean; // 是否是 Safari 浏览器
  isWeiXin: boolean; // 是否是微信浏览器
  safariVersion: string | null; // Safari 版本号，可能为 null
  isDingDing: boolean; // 是否是钉钉客户端
}

let info: PlatformInfo;

/**
 * 获取用户平台信息，使用浏览器的用户代理和平台数据。
 * @returns {PlatformInfo} 用户平台信息。
 */
export function platformInfo(): PlatformInfo {
  if (info) return info;

  const userAgent = navigator.userAgent;
  const platform = navigator.platform;

  let isWindows;
  let isiOS;
  let isChromeOS;
  let isLinux;

  const isMacOs = /Mac/.test(platform);

  if (!isMacOs) {
    isWindows = /Win/.test(platform);
    if (!isWindows) {
      isiOS = /(iPhone|iPad|iPod|iOS)/i.test(userAgent);
      if (!isiOS) {
        isChromeOS = /CrOS/.test(userAgent);
        if (!isChromeOS) {
          isLinux = /Linux/.test(platform);
        }
      }
    }
  }

  const safariResult = /version\/([\d.]+).*safari/i.exec(userAgent);

  info = {
    isMac: isMacOs,
    isWindows: isWindows || false,
    isiOS: isiOS || false,
    isChromeOS: isChromeOS || false,
    isLinux: isLinux || false,
    isChrome: userAgent.indexOf("Chrome") > -1,
    isFirefox: userAgent.indexOf("Firefox") > -1,
    isEdge: userAgent.indexOf("Edge") > -1,
    isWeiXin: userAgent.indexOf("MicroMessenger") > -1,
    isSafari: !!safariResult,
    safariVersion: safariResult && safariResult[1],
    isDingDing: /DingTalk/.test(navigator.userAgent),
  };

  return info;
}

export function isProblematicChromeVersion(): boolean {
  const chromeVersionRex = /Chrome\/([.0-9]*)/.exec(window.navigator.userAgent);
  let chromeVersion = "";
  if (chromeVersionRex) {
    chromeVersion = chromeVersionRex[1];
  }
  if (!chromeVersion) return false;

  const ProblematicChromeVersionList = [
    "94.0.4606.54",
    "94.0.4606.61",
    "94.0.4606.71",
  ];
  return ProblematicChromeVersionList.includes(chromeVersion);
}

type WebglInfo = string;
export const GpuInfoUnknow = "unknow" as const;
type GpuInfoUnknowType = typeof GpuInfoUnknow;

type GpuInfo = {
  webglInfo: GpuInfoUnknowType | WebglInfo;
  gpuVendor: GpuInfoUnknowType | "amd" | "nvidia" | "intel" | "ati";
  gpuApi:
    | GpuInfoUnknowType
    | "direct3d9"
    | "direct3d11"
    | "opengl"
    | "metal"
    | "vulkan";
  webglVersion: "experimental" | "webgl2" | "webgl";
};
let cacheWebglInfo: GpuInfo | null = null;
export function getGpuInfo(): GpuInfo {
  if (cacheWebglInfo) return cacheWebglInfo;
  const canvas = document.createElement("canvas");
  let context: WebGL2RenderingContext | WebGLRenderingContext | null = null;
  let webglInfo: GpuInfo["webglInfo"] = GpuInfoUnknow;
  let gpuVendor: GpuInfo["gpuVendor"] = GpuInfoUnknow;
  let gpuApi: GpuInfo["gpuApi"] = GpuInfoUnknow;
  let webglVersion: GpuInfo["webglVersion"] = "experimental";
  try {
    context = canvas.getContext("webgl2");
    if (context) {
      webglVersion = "webgl2";
    }
  } catch (l) {
    // empty
  }
  if (!context) {
    try {
      context = canvas.getContext("webgl");
      if (context) {
        webglVersion = "webgl";
      }
    } catch (l) {
      // empty
    }
  }

  if (context) {
    const debugInfo = context?.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      webglInfo =
        (
          context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) ?? ""
        ).toLowerCase() || GpuInfoUnknow;
      gpuVendor =
        (/\bamd\b|\bati\b|\bnvidia\b|\bintel\b/.exec(
          webglInfo,
        )?.[0] as GpuInfo["gpuVendor"]) || GpuInfoUnknow;
      if (gpuVendor === "ati") gpuVendor = "amd";
      gpuApi =
        (/direct3d9|direct3d11|opengl|metal|vulkan/.exec(
          webglInfo,
        )?.[0] as GpuInfo["gpuApi"]) || GpuInfoUnknow;
    }
  }

  if (
    platformInfo().isSafari ||
    navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
  ) {
    webglVersion = "webgl";
  }

  cacheWebglInfo = {
    gpuVendor,
    gpuApi,
    webglVersion,
    webglInfo,
  };

  return cacheWebglInfo;
}

/**
 * 判断当前环境能否使用 caches API
 * @returns boolean
 */
export const canUseCachesAPI = (): boolean => "caches" in window;

/**
 * 判断当前环境是否支持 P3
 * @returns boolean
 */
export const isP3Supported = (): boolean => {
  if ("matchMedia" in window) {
    return window.matchMedia("(color-gamut: p3)").matches;
  }
  return false;
};
