import React from 'react';
import CompositeSprite from '../CompositeSprite';
import styles from '../SpriteTool.css';
import UnitModel from '../types/UnitModel';

type Props = {
  unit: UnitModel,
  equipment: string[],
  entityToPaletteSwaps: Record<string, Record<string, string>>,
  onImageLoaded: (filename: string, blob: string) => void
};

const SpriteSheetPanel = ({ unit, equipment, entityToPaletteSwaps, onImageLoaded }: Props) => {
  return (
    <tr>
      <td colSpan={2}>
        <div className={styles.title}>
          Sprite Sheet
        </div>
        <div className={styles.spriteSheet}>
          {
            Object.entries(unit.activities)
              .map(([activity, { directions, frameNumbers }]) =>
                frameNumbers.map(frameNumber =>
                  directions.map(direction => (
                    <CompositeSprite
                      key={`${unit.spriteName}_${activity}_${direction}_${frameNumber}`}
                      unit={unit}
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
