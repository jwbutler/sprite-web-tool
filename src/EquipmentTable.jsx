{
  const EquipmentTable = ({equipment, enabledEquipment, onChange}) => (
    <div className="EquipmentTable">
      <table>
        {
          equipment.sort()
          .map(item => (
            <tr>
              <td>
                {item}
              </td>
              <td>
                <input
                  type="checkbox"
                  name="equipment"
                  value={item}
                  checked={enabledEquipment.indexOf(item) > -1}
                  onChange={e => onChange(e)}
                  key={item}
                />
              </td>
            </tr>
          ))
        }
      </table>
    </div>
  );

  window.jwb.EquipmentTable = EquipmentTable;
}