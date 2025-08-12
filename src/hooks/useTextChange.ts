import { type Ref, ref, onBeforeUnmount } from "vue";

interface UseTextChangeProps {
  initText: string;
  newText: string;
  delay?: number;
}

interface UseTextChangeReturn {
  text: Ref<string>;
  changing: Ref<boolean>;
  handleChange: (value?: string) => void;
}

const defaultDelay = 3000;

export const useTextChange = ({
  initText,
  newText,
  delay = defaultDelay,
}: UseTextChangeProps): UseTextChangeReturn => {
  const text = ref(initText);
  const changing = ref(false);
  const timer = ref<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value?: string) => {
    const newValue = value ?? newText;
    text.value = newValue;
    changing.value = true;
    timer.value = setTimeout(() => {
      text.value = initText;
      changing.value = false;
    }, delay);
  };

  onBeforeUnmount(() => {
    if (timer.value) {
      clearTimeout(timer.value);
    }
  });

  return {
    text,
    changing,
    handleChange,
  };
};
