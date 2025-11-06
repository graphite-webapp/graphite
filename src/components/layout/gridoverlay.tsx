import styles from '@/styles/modules/components/layout/gridoverlay.module.scss';

type GridOverlayProps = {
  show: boolean;
};

export default function GridOverlay({ show = false }: GridOverlayProps) {
  return (
    <div className={`${show ? 'd-flex' : 'd-none'} ${styles.grid}`}>
      <div className={`${styles.grid_item} ${styles.hideMd}`} data-col="md"></div>
      <div className={styles.grid_item} data-col="md"></div>
      <div className={styles.grid_item} data-col="md"></div>
      <div className={styles.grid_item} data-col="md"></div>
      <div className={styles.grid_item} data-col="sm"></div>
      <div className={styles.grid_item} data-col="sm"></div>
      <div className={styles.grid_item} data-col="sm"></div>
      <div className={styles.grid_item} data-col="sm"></div>
      <div className={styles.grid_item}></div>
      <div className={styles.grid_item}></div>
      <div className={styles.grid_item}></div>
      <div className={styles.grid_item}></div>
    </div>
  );
}
