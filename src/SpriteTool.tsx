import React from 'react';
import FrameSelector from './components/FrameSelector';
import SpriteSheetPanel from './components/SpriteSheetPanel';

import styles from './SpriteTool.css';
import ChangeEvent from './types/ChangeEvent';
import { generateDownloadLink } from './utils';
import EquipmentTable from './components/EquipmentTable';
import CompositeSprite from './CompositeSprite';
import PaletteSwapPanel from './components/PaletteSwapPanel';
import SpriteDefinitions from './SpriteDefinitions';

const { getDefaultUnit, getUnitData, getAllUnitNames } = SpriteDefinitions;

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

  handleChange(e: ChangeEvent) {
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

  handleImageLoaded = (filename: string, blob: string) => {
    const { filenameToBlob } = this.state;
    filenameToBlob[filename] = blob;
    this.setState({
      ...this.state,
      filenameToBlob
    });
  };

  render() {
    return (
      <div className={styles.SpriteTool}>
        <table className={styles.mainTable}>
          <tbody>
          <UnitSelector onChange={e => this.handleChange(e)} />
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
                onChange={e => this.handleChange(e)}
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
                  onChange={e => this.handleChange(e)}
                />
              </div>
              <FrameSelector
                unit={this.state.unitName}
                activity={this.state.activity}
                onChange={e => this.handleChange(e)}
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
                onChange={e => this.handleChange(e)}
              />
            </td>
          </tr>
          <SpriteSheetPanel
            entityToPaletteSwaps={this.state.paletteSwaps}
            equipment={this.state.equipment}
            unitName={this.state.unitName}
            onImageLoaded={this.handleImageLoaded}
          />
          {/* Render save button */}
          <tr>
            <td colSpan={2}>
              <button onClick={() => this.downloadZip()}>
                Download!
              </button>
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

type UnitSelectorProps = {
  onChange: (e: ChangeEvent) => void
};

const UnitSelector = ({ onChange }: UnitSelectorProps) => {
  return (
    <tr>
      <td>
        <label htmlFor="unit">
          Unit type
        </label>
      </td>
      <td>
        <select name="unit" onChange={e => onChange(e)}>
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
  );
};

export default SpriteTool;
