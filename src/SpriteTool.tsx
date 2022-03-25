import React from 'react';

import styles from './SpriteTool.css';
import { generateDownloadLink, UNIT_DATA } from './utils';
import EquipmentTable from './EquipmentTable';
import CompositeSprite from './CompositeSprite';
import PaletteSwapPanel from './PaletteSwapPanel';

type State = {
  unit: string,
  activity: string,
  direction: string,
  frameNumber: number | string,
  equipment: string[],
  filenameToBlob: Record<string, any>,
  dataBlob: any,
  dataLink: any,
  paletteSwaps: Record<string, Record<string, string>>
};

class SpriteTool extends React.PureComponent<{}, State> {
  constructor(props: {}) {
    super(props);

    const unit = Object.keys(UNIT_DATA)[0];
    const activity = Object.keys(UNIT_DATA[unit].activities)[0];
    const direction = UNIT_DATA[unit].activities[activity].directions[0];
    const frameNumber = UNIT_DATA[unit].activities[activity].frameNumbers[0];
    const equipment: string[] = [];

    this.state = {
      unit,
      activity,
      direction,
      frameNumber,
      equipment,
      dataBlob: null,
      dataLink: null,
      filenameToBlob: {},
      // spriteName -> (color -> color)
      paletteSwaps: {}
    };
  }

  onChange(e: any) {
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

    updatedState.equipment = updatedState.equipment.filter(item => UNIT_DATA[updatedState.unit].equipment.indexOf(item) > -1);

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
                    Object.keys(UNIT_DATA).map(spriteName => (
                      /* @ts-ignore */
                      <option name={spriteName} key={spriteName}>
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
                  equipment={UNIT_DATA[this.state.unit].equipment}
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
                    unit={this.state.unit}
                    equipment={this.state.equipment}
                    activity={this.state.activity}
                    direction={this.state.direction}
                    frameNumber={this.state.frameNumber}
                    paletteSwaps={this.state.paletteSwaps}
                    width={160}
                    height={160}
                    onChange={e => this.onChange(e)}
                  />
                </div>
                {/* Render activity selection */}
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <label htmlFor="activity">
                          Activity
                        </label>
                      </td>
                      <td>
                        <select name="activity" onChange={e => this.onChange(e)}>
                          {
                            Object.keys(UNIT_DATA[this.state.unit].activities).map(activity => (
                              /* @ts-ignore */
                              <option name={activity} key={activity}>
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
                        <select name="direction" onChange={e => this.onChange(e)}>
                          {
                            UNIT_DATA[this.state.unit].activities[this.state.activity].directions.map(direction => (
                              /* @ts-ignore */
                              <option name={direction} key={direction}>
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
                        <select name="frameNumber" onChange={e => this.onChange(e)}>
                          {
                            UNIT_DATA[this.state.unit].activities[this.state.activity].frameNumbers.map(frameNumber => (
                              /* @ts-ignore */
                              <option name={frameNumber} key={frameNumber}>
                                {frameNumber}
                              </option>
                            ))
                          }
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
                    Object.entries(UNIT_DATA[this.state.unit].activities)
                      .map(([activity, { directions, frameNumbers }]) =>
                        frameNumbers.map(frameNumber =>
                          directions.map(direction => (
                            <CompositeSprite
                              key={`${this.state.unit}_${activity}_${direction}_${frameNumber}`}
                              unit={this.state.unit}
                              equipment={this.state.equipment}
                              activity={activity}
                              direction={direction}
                              frameNumber={frameNumber}
                              paletteSwaps={this.state.paletteSwaps}
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
    return [this.state.unit, ...this.state.equipment];
  };
}

export default SpriteTool;
