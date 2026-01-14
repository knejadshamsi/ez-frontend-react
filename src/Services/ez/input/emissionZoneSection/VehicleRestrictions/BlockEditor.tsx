import { DeleteOutlined, StopOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from './styles/blockEditor.module.less';
import { TimeBlock, BlockEditorProps } from './types';
import '../locales';

const BlockEditor = ({ activeBlock, onUpdate, onDelete }: BlockEditorProps) => {
  const { t } = useTranslation('ez-emission-zone-section');
  if (!activeBlock || !activeBlock.vehicle || !activeBlock.block) return null;

  const { vehicle, block } = activeBlock;

  const handleUpdate = (updates: Partial<TimeBlock>) => {
    onUpdate(vehicle.type, block.id, updates);
  };

  const handleDelete = () => {
    onDelete(vehicle.type, block.id);
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorHeader}>
        <h3 className={styles.editorTitle}>{t('vehicleRestrictions.blockEditor.settings')}</h3>
        <button className={styles.deleteButton} onClick={handleDelete}>
          <DeleteOutlined className={styles.deleteIcon} />
        </button>
      </div>

      <div className={styles.typeSection}>
        <label className={styles.label}>{t('vehicleRestrictions.blockEditor.type')}</label>
        <div className={styles.typeButtons}>
          <button
            className={`${styles.typeButton} ${block.type === 'restricted' ? styles.restricted : ''}`}
            onClick={() => handleUpdate({ type: 'restricted' })}
          >
            <div className={styles.buttonContent}>
              <ExclamationCircleOutlined className={styles.typeIcon} />
              <span>{t('vehicleRestrictions.blockEditor.restrict')}</span>
            </div>
          </button>

          <button
            className={`${styles.typeButton} ${block.type === 'banned' ? styles.banned : ''}`}
            onClick={() => handleUpdate({ type: 'banned' })}
          >
            <div className={styles.buttonContent}>
              <StopOutlined className={styles.typeIcon} />
              <span>{t('vehicleRestrictions.blockEditor.ban')}</span>
            </div>
          </button>
        </div>
      </div>

      {block.type === 'restricted' && (
        <div className={styles.penaltyContainer}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>{t('vehicleRestrictions.blockEditor.penalty')}</label>
            <input
              type="number"
              min="1"
              step="1"
              className={styles.input}
              value={block.penalty || 1}
              onChange={(e) => handleUpdate({ penalty: Math.max(1, parseInt(e.target.value) || 1) })}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>{t('vehicleRestrictions.blockEditor.interval')}</label>
            <input
              type="number"
              min="1"
              step="1"
              className={styles.input}
              value={block.interval || 1800}
              onChange={(e) => handleUpdate({ interval: parseInt(e.target.value) || 1800 })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockEditor;
