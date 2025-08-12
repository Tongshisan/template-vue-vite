/*
 * @Author: 李智 lizhi01@jwzg.com
 * @Date: 2025-08-12 15:00:38
 * @LastEditors: 李智 lizhi01@jwzg.com
 * @LastEditTime: 2025-08-12 15:00:38
 * @FilePath: /template-vue-vite/src/hooks/useMediaQuery.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { ref, onMounted, onUnmounted } from "vue";

export function useMediaQuery(query: string) {
  const mediaQuery = window.matchMedia(query);
  // 直接使用 mediaQuery.matches 作为初始值
  const matches = ref(mediaQuery.matches);

  const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
    matches.value = e.matches;
  };

  onMounted(() => {
    mediaQuery.addEventListener("change", updateMatches);
  });

  onUnmounted(() => {
    mediaQuery.removeEventListener("change", updateMatches);
  });

  return matches;
}
