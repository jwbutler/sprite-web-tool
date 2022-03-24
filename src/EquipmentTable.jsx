import React from 'react';
import styles from './EquipmentTable.css';

const EquipmentTable = ({ equipment, enabledEquipment, onChange }) => (
  <div className={styles.EquipmentTable}>
    {
      equipment.sort()
        .map(item => (
          <div className={styles.row}>
            <div className={styles.col}>
              {item}
              </div>
            <div className={styles.col}>
              <input
                type="checkbox"
                name="equipment"
                value={item}
                checked={enabledEquipment.indexOf(item) > -1}
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
