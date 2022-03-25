import React from 'react';
import CompositeSprite from '../CompositeSprite';
import SpriteDefinitions from '../SpriteDefinitions';
import styles from '../SpriteTool.css';

const { getUnitData } = SpriteDefinitions;

type Props = {
  unitName: string,
  equipment: string[],
  entityToPaletteSwaps: Record<string, Record<string, string>>,
  onImageLoaded: (filename: string, blob: string) => void
};

const SpriteSheetPanel = ({ unitName, equipment, entityToPaletteSwaps, onImageLoaded }: Props) => {
  return (
    <tr>
      <td colSpan={2}>
        <div className={styles.title}>
          Sprite Sheet
        </div>
        <div className={styles.spriteSheet}>
          {
            Object.entries(getUnitData(unitName).activities)
              .map(([activity, { directions, frameNumbers }]) =>
                frameNumbers.map(frameNumber =>
                  directions.map(direction => (
                    <CompositeSprite
                      key={`${unitName}_${activity}_${direction}_${frameNumber}`}
                      unit={unitName}
                      equipment={equipment}
                      activity={activity}
                      direction={direction}
                      frameNumber={frameNumber}
                      entityToPaletteSwaps={entityToPaletteSwaps}
                      onImageLoaded={onImageLoaded}
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
  );
};

export default SpriteSheetPanel;
