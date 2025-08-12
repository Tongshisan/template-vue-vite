import { type Ref, computed } from "vue";
import { useMediaQuery } from "./useMediaQuery";

interface IUseIsMobileReturn {
  isMobile: Ref<boolean>;
}

const breakpointMobile = 768;

export function useIsMobile(): IUseIsMobileReturn {
  // 直接获取 CSS 变量
  // const mobileBreakpoint = getComputedStyle(document.documentElement)
  //   .getPropertyValue("--rd-breakpoint-mobile")
  //   .trim();

  // 创建一个 mediaQuery 实例
  const mediaQueryMatches = useMediaQuery(`(max-width: ${breakpointMobile}px)`);

  // computed 只需要返回 matches 的值
  const isMobile = computed(() => mediaQueryMatches.value);

  return {
    isMobile,
  };
}
