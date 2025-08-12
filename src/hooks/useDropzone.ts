import { computed, ref, unref, watch } from "vue";
import type { Ref, ComputedRef } from "vue";

interface IDropZoneOptions {
  onDrop?: (e: DragEvent) => void;
  onDragEnter?: (e: DragEvent) => void;
  onDragLeave?: (e: DragEvent) => void;
  onDragOver?: (e: DragEvent) => void;
  // 是否要阻止拖拽
  shouldPrevent?: () => boolean;
}

export interface IUseDropZoneReturn {
  isDragging: ComputedRef<boolean>;
  files: Ref<File[]>;
  removeEvent: (targetEl: HTMLElement) => void;
}

export const useDropZone = (
  target: Ref<HTMLElement | undefined> | HTMLElement | undefined,
  options: IDropZoneOptions = {},
): IUseDropZoneReturn => {
  const dragCounter = ref(0);
  const files = ref<File[]>([]);
  const isDragging = computed(() => dragCounter.value > 0);
  const targetRef = computed(() => unref(target));

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    options.onDragOver?.(e);
  };

  const handleDragEnter = (e: DragEvent) => {
    if (options.shouldPrevent?.()) {
      return;
    }
    e.preventDefault();
    dragCounter.value++;
    options.onDragEnter?.(e);
  };

  const handleDragLeave = (e: DragEvent) => {
    if (options.shouldPrevent?.()) {
      return;
    }
    e.preventDefault();
    dragCounter.value--;
    options.onDragLeave?.(e);
  };

  const handleDrop = (e: DragEvent) => {
    if (options.shouldPrevent?.()) {
      return;
    }
    e.preventDefault();
    dragCounter.value = 0;
    const fs = e.dataTransfer?.files;
    files.value = Array.from(fs ?? []);
    options.onDrop?.(e);
  };

  const bindEvent = (targetEl: HTMLElement) => {
    /* eslint-disable */
    targetEl.addEventListener("dragenter", handleDragEnter);
    targetEl.addEventListener("dragleave", handleDragLeave);
    targetEl.addEventListener("dragover", handleDragOver);
    targetEl.addEventListener("drop", handleDrop);
  };

  watch(
    targetRef,
    (targetEl) => {
      if (!targetEl) {
        return;
      }
      bindEvent(targetEl);
    },
    { immediate: true },
  );

  const removeEvent = (targetEl: HTMLElement | null) => {
    if (!targetEl) return;
    targetEl.removeEventListener("dragenter", handleDragEnter);
    targetEl.removeEventListener("dragleave", handleDragLeave);
    targetEl.removeEventListener("dragover", handleDragOver);
    targetEl.removeEventListener("drop", handleDrop);
  };

  return {
    isDragging,
    files,
    removeEvent,
  };
};
