import { DeleteOutlined, StopOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './styles/blockEditor.module.less';
import { TimeBlock, BlockEditorProps } from './types';

const BlockEditor = ({ activeBlock, onUpdate, onDelete }: BlockEditorProps) => {
  if (!activeBlock || !activeBlock.vehicle || !activeBlock.block) return null;

  const { vehicle, block } = activeBlock;

  const handleUpdate = (updates: Partial<TimeBlock>) => {
    onUpdate(vehicle.id, block.id, updates);
  };

  const handleDelete = () => {
    onDelete(vehicle.id, block.id);
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorHeader}>
        <h3 className={styles.editorTitle}>Settings</h3>
        <button className={styles.deleteButton} onClick={handleDelete}>
          <DeleteOutlined className={styles.deleteIcon} />
        </button>
      </div>

      <div className={styles.typeSection}>
        <label className={styles.label}>Type</label>
        <div className={styles.typeButtons}>
          <button
            className={`${styles.typeButton} ${block.type === 'restricted' ? styles.restricted : ''}`}
            onClick={() => handleUpdate({ type: 'restricted' })}
          >
            <div className={styles.buttonContent}>
              <ExclamationCircleOutlined className={styles.typeIcon} />
              <span>Restrict</span>
            </div>
          </button>

          <button
            className={`${styles.typeButton} ${block.type === 'banned' ? styles.banned : ''}`}
            onClick={() => handleUpdate({ type: 'banned' })}
          >
            <div className={styles.buttonContent}>
              <StopOutlined className={styles.typeIcon} />
              <span>Ban</span>
            </div>
          </button>
        </div>
      </div>

      {block.type === 'restricted' && (
        <div className={styles.penaltyContainer}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Penalty</label>
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
            <label className={styles.inputLabel}>Interval (s)</label>
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
