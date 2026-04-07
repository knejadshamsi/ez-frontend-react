import { useTranslation } from 'react-i18next';
import { StatusNotification } from './StatusNotification';
import '../locales';

export const CancellingState = () => {
  const { t } = useTranslation('ez-progress');

  return (
    <StatusNotification title={t('cancellation.inProgress')} />
  );
};
