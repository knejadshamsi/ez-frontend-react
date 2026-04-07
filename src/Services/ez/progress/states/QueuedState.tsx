import { useTranslation } from 'react-i18next';
import { StatusNotification } from './StatusNotification';
import '../locales';

interface QueuedStateProps {
  onCancel: () => void;
  onStartNew?: () => void;
}

export const QueuedState = ({ onCancel, onStartNew }: QueuedStateProps) => {
  const { t } = useTranslation('ez-progress');

  return (
    <StatusNotification
      title={t('queued.title')}
      subtitle={t('queued.subtitle')}
      onCancel={onCancel}
      cancelLabel={t('buttons.cancel')}
      extraButton={onStartNew ? { label: t('batch.startNew'), onClick: onStartNew } : undefined}
    />
  );
};
