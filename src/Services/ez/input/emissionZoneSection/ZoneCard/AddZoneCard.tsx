import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import styles from './AddZoneCard.module.less';
import '../locales';

const AddZoneCard = ({ onClick, id }) => {
  const { t } = useTranslation('ez-emission-zone-section');
  return (
    <div className={styles.addCardContainer} onClick={onClick} id={id}>
      <PlusOutlined className={styles.plusIcon} />
      <span className={styles.addText}>{t('addZoneCard.text')}</span>
    </div>
  );
};

export default AddZoneCard;