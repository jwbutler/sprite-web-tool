import React from 'react';
import SpriteDefinitions from '../SpriteDefinitions';
import ChangeEvent from '../types/ChangeEvent';
const { getUnitData } = SpriteDefinitions;

type Props = {
  onChange: (e: ChangeEvent) => void,
  unit: string,
  activity: string
};

const FrameSelector = ({ onChange, unit, activity }: Props) => (
  <table>
    <tbody>
      <tr>
        <td>
          <label htmlFor="activity">
            Activity
          </label>
        </td>
        <td>
          <select name="activity" onChange={e => onChange(e)}>
            {
              Object.keys(getUnitData(unit).activities).map(activity => (
                <option key={activity}>
                  {activity}
                </option>
              ))
            }
          </select>
        </td>
      </tr>
      {/* Render direction selection */}
      <tr>
        <td>
          <label htmlFor="direction">
            Direction
          </label>
        </td>
        <td>
          <select name="direction" onChange={e => onChange(e)}>
            {
              getUnitData(unit).activities[activity].directions.map(direction => (
                <option key={direction}>
                  {direction}
                </option>
              ))
            }
          </select>
        </td>
      </tr>
      {/* Render frame number selection */}
      <tr>
        <td>
          <label htmlFor="frameNumber">
            Frame Number
          </label>
        </td>
        <td>
          <select name="frameNumber" onChange={e => onChange(e)}>
            {
              getUnitData(unit).activities[activity].frameNumbers.map(frameNumber => (
                <option key={frameNumber}>
                  {frameNumber}
                </option>
              ))
            }
          </select>
        </td>
      </tr>
    </tbody>
  </table>
);

export default FrameSelector;
