import { useEffect } from 'react';
import { APP_NAME } from '../config';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : `${APP_NAME} – Fresh from local farmers markets`;
  }, [title]);
}
