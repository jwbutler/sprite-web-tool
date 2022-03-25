import React from 'react';

import styles from './SpriteTool.css';
import { generateDownloadLink } from './utils';
import EquipmentTable from './EquipmentTable';
import CompositeSprite from './CompositeSprite';
import PaletteSwapPanel from './PaletteSwapPanel';
import SpriteDefinitions from './SpriteDefinitions';

const { getDefaultUnit, getUnitData, getAllUnitNames } = SpriteDefinitions;

type ChangeEvent = {
  target: {
    name: string,
    type: string,
    value: string
  }
};

type State = {
  unitName: string,
  activity: string,
  direction: string,
  frameNumber: number | string,
  equipment: string[],
  filenameToBlob: Record<string, string>,
  dataBlob: string | null,
  dataLink: string | null,
  paletteSwaps: Record<string, Record<string, string>>
};

class SpriteTool extends React.PureComponent<{}, State> {
  constructor(props: {}) {
    super(props);

    const unitName = getDefaultUnit();
    const unit = getUnitData(unitName);
    const activity = Object.keys(unit.activities)[0];
    const direction = unit.activities[activity].directions[0];
    const frameNumber = unit.activities[activity].frameNumbers[0];
    const equipment: string[] = [];

    this.state = {
      unitName,
      activity,
      direction,
      frameNumber,
      equipment,
      dataBlob: null,
      dataLink: null,
      filenameToBlob: {},
      paletteSwaps: {}
    };
  }

  onChange(e: ChangeEvent) {
    const field = e.target.name;
    const eventValue = e.target.value;
    let value;
    if (e.target.type === 'checkbox') {
      // @ts-ignore
      value = [...(this.state[field])];
      const index = value.indexOf(eventValue);
      if (index > -1) {
        value.splice(index, 1);
      } else {
        value.push(eventValue);
      }
    } else {
      value = eventValue;
    }

    const updatedState = {
      ...this.state,
      [field]: value
    };

    updatedState.equipment = updatedState.equipment.filter(item => getUnitData(updatedState.unitName).equipment.includes(item));

    this.setState(updatedState);
  }

  render() {
    return (
      <div className={styles.SpriteTool}>
        <table className={styles.mainTable}>
          <tbody>
            {/* Render unit selection */}
            <tr>
              <td>
                <label htmlFor="unit">
                  Unit type
                </label>
              </td>
              <td>
                <select name="unit" onChange={e => this.onChange(e)}>
                  {
                    getAllUnitNames().map(spriteName => (
                      <option key={spriteName}>
                        {spriteName}
                      </option>
                    ))
                  }
                </select>
              </td>
            </tr>
            {/* Render equipment selection table */}
            <tr>
              <td>
                <label htmlFor="equipment">
                  Equipment
                </label>
              </td>
              <td>
                <EquipmentTable
                  equipment={getUnitData(this.state.unitName).equipment}
                  enabledEquipment={this.state.equipment}
                  onChange = {e => this.onChange(e)}
                />
              </td>
            </tr>
            <tr>
              {/* Render preview */}
              <td>
                <div className={styles.title}>
                  Preview
                </div>
                <div className={styles.preview}>
                  <CompositeSprite
                    unit={this.state.unitName}
                    equipment={this.state.equipment}
                    activity={this.state.activity}
                    direction={this.state.direction}
                    frameNumber={this.state.frameNumber}
                    entityToPaletteSwaps={this.state.paletteSwaps}
                    width={160}
                    height={160}
                    onChange={e => this.onChange(e)}
                  />
                </div>
                {/* Render activity selection */}
                <FrameSelectionTable
                  unit={this.state.unitName}
                  activity={this.state.activity}
                  direction={this.state.direction}
                  frameNumber={this.state.frameNumber}
                  onChange={e => this.onChange(e)}
                />
              </td>
              {/* Render palette swap panel */}
              <td>
                <div className={styles.title}>
                  Palette Swaps
                </div>
                <PaletteSwapPanel
                  spriteNames={this._getEnabledSpriteNames()}
                  paletteSwaps={this.state.paletteSwaps}
                  onChange={e => this.onChange(e)}
                />
              </td>
            </tr>
            {/* Render full sprite table */}
            <tr>
              <td colSpan={2}>
                <div className={styles.title}>
                  Sprite Sheet
                </div>
                <div className={styles.spriteSheet}>
                  {
                    Object.entries(getUnitData(this.state.unitName).activities)
                      .map(([activity, { directions, frameNumbers }]) =>
                        frameNumbers.map(frameNumber =>
                          directions.map(direction => (
                            <CompositeSprite
                              key={`${this.state.unitName}_${activity}_${direction}_${frameNumber}`}
                              unit={this.state.unitName}
                              equipment={this.state.equipment}
                              activity={activity}
                              direction={direction}
                              frameNumber={frameNumber}
                              entityToPaletteSwaps={this.state.paletteSwaps}
                              onImageLoaded={(filename, blob) => {
                                const { filenameToBlob } = this.state;
                                filenameToBlob[filename] = blob;
                                this.setState({
                                  ...this.state,
                                  filenameToBlob
                                });
                              }}
                              width={40}
                              height={40}
                            />
                          ))
                        )
                      )
                  }
                </div>
              </td>
            </tr>
            {/* Render save button */}
            <tr>
              <td colSpan={2}>
                {
                  <button onClick={() => this.downloadZip()}>
                    Download!
                  </button>
                }
                {
                  this.state.dataLink && (
                    <a href={this.state.dataLink} download="sprites.zip">Download</a>
                  )
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  downloadZip() {
    generateDownloadLink(this.state.filenameToBlob).then(content => {
      const dataLink = `data:application/zip;base64,${content}`;

      // SUUUUUPER HACK ALERT
      const a = document.createElement('a');
      a.href = dataLink;
      a.download = 'sprites.zip';

      a.hidden = true;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  _getEnabledSpriteNames = () => {
    return [this.state.unitName, ...this.state.equipment];
  };
}

type FrameSelectionTableProps = {
  onChange: (e: any) => void,
  unit: string,
  activity: string,
  direction: string,
  frameNumber: number | string
};

const FrameSelectionTable = ({ onChange, unit, activity, direction, frameNumber }: FrameSelectionTableProps) => (
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

export default SpriteTool;
