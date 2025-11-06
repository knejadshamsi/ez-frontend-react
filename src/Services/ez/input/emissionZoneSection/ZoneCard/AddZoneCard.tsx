import { PlusOutlined } from '@ant-design/icons';
import styles from './AddZoneCard.module.less';

const AddZoneCard = ({ onClick, id }) => {
  return (
    <div className={styles.addCardContainer} onClick={onClick} id={id}>
      <PlusOutlined className={styles.plusIcon} />
      <span className={styles.addText}>Add New Zone</span>
    </div>
  );
};

export default AddZoneCard;