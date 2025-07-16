import { useMemo } from 'react';
import { transformWordPressMedia } from '../lib/media';

export const useWordPressMedia = <T,>(data: T): T => {
  return useMemo(() => {
    return transformWordPressMedia(data);
  }, [data]);
};
