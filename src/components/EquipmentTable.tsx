import React from 'react';
import ChangeEvent from '../types/ChangeEvent';
import styles from './EquipmentTable.css';

type Props = {
  equipment: string[],
  enabledEquipment: string[],
  onChange: (e: ChangeEvent) => void;
};

const EquipmentTable = ({ equipment, enabledEquipment, onChange }: Props) => (
  <div className={styles.EquipmentTable}>
    {
      equipment.sort()
        .map(item => (
          <div className={styles.row} key={item}>
            <div className={styles.col}>
              {item}
            </div>
            <div className={styles.col}>
              <input
                type="checkbox"
                name="equipment"
                value={item}
                checked={enabledEquipment.includes(item)}
                onChange={e => onChange(e)}
                key={item}
              />
            </div>
          </div>
        ))
    }
  </div>
);

export default EquipmentTable;
