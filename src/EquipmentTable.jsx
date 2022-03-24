import React from 'react';
import './EquipmentTable.css';

const EquipmentTable = ({ equipment, enabledEquipment, onChange }) => (
  <div className="EquipmentTable">
    {
      equipment.sort()
        .map(item => (
          <div className="row">
            <div className="col">
              {item}
              </div>
            <div className="col">
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
