import React from 'react';
import SpriteDefinitions from './SpriteDefinitions';
import styles from './SpriteTool.css';
import ChangeEvent from './types/ChangeEvent';
import UnitModel from './types/UnitModel'; // TODO should not use a global style sheet

const { getImageFilename, getShortFilename, getEquipmentData, getUnitData } = SpriteDefinitions;

import {
  comparing,
  getImageColors,
  isBehind,
  replaceColors
} from './utils';

const UnitImage = ({ spriteName, activity, direction, frameNumber, paletteSwaps }: any) => (
  <img
    className={styles.hidden}
    src={getImageFilename(spriteName, activity, direction, frameNumber, false)}
    key={spriteName}
    data-spritename={spriteName}
    data-activity={activity}
    data-direction={direction}
    data-framenumber={frameNumber}
    data-paletteswaps={JSON.stringify(paletteSwaps)}
  />
);

const EquipmentImage = ({ spriteName, activity, direction, frameNumber, paletteSwaps, onError }: any) => (
  <img
    className={styles.hidden}
    src={getImageFilename(spriteName, activity, direction, frameNumber, false)}
    key={spriteName}
    onError={e => onError(e)}
    data-behind={getImageFilename(spriteName, activity, direction, frameNumber, true)}
    data-spritename={spriteName}
    data-activity={activity}
    data-direction={direction}
    data-framenumber={frameNumber}
    data-paletteswaps={JSON.stringify(paletteSwaps)}
  />
);

type Props = {
  unit: UnitModel,
  equipment: string[],
  activity: string,
  direction: string,
  frameNumber: string | number,
  entityToPaletteSwaps: Record<string, Record<string, string | number[]>>,
  width: number,
  height: number,
  onChange?: (event: ChangeEvent) => void,
  onImageLoaded?: (outputFilename: string, imageBlob: string) => void
}

class CompositeSprite extends React.PureComponent<Props> {
  private loadedImages: HTMLImageElement[];
  private container: HTMLElement | null;
  private canvas: HTMLCanvasElement | null;

  constructor(props: Props) {
    super(props);
    this.loadedImages = [];
  }

  render = () => {
    const { unit, equipment, activity, direction, frameNumber, entityToPaletteSwaps, width, height } = this.props;
    return (
      <span ref={e => { this.container = e; }}>
        <UnitImage
          spriteName={unit.spriteName}
          activity={activity}
          direction={direction}
          frameNumber={frameNumber}
          paletteSwaps={entityToPaletteSwaps[unit.spriteName]}
        />
        {
          equipment.map(spriteName => (
            <EquipmentImage
              spriteName={spriteName}
              activity={activity}
              direction={direction}
              frameNumber={frameNumber}
              paletteSwaps={entityToPaletteSwaps[spriteName]}
              onError={(e: any) => this._swapToBehindImage(e)}
            />
          ))
        }
        <canvas
          width={width}
          height={height}
          ref={canvas => { this.canvas = canvas; }}
        />
      </span>
    );
  };

  _onImageLoaded = (image: HTMLImageElement) => {
    if (!this.loadedImages.includes(image)) {
      this.loadedImages.push(image);
    }

    if (this._getImages().every(i =>
      i.complete && this.loadedImages.includes(i)
    )) {
      this._drawImages();
    }
  };

  _drawImages = () => {
    const { canvas, container } = this;
    const { unit,  activity, direction, frameNumber, entityToPaletteSwaps, onChange, onImageLoaded } = this.props;

    const context = canvas?.getContext('2d');
    if (!canvas || !context || !container) {
      return;
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    type ImageWithName = { image: HTMLImageElement, spriteName: string };
    // @ts-ignore huh?
    const images: ImageWithName[] = [...container.querySelectorAll(`img.${styles.hidden}`)]
      .map(image => ({ image, spriteName: image.getAttribute('data-spritename') }));

    const behindImages = images.filter(({ image, spriteName }) => isBehind(image))
      .sort(comparing(({ image, spriteName }) => getEquipmentData(spriteName).drawOrder));
    const unitImage = images.filter(({ image, spriteName }) => getUnitData(spriteName))[0];
    const aheadImages = images.filter(({ image, spriteName }) => !getUnitData(spriteName))
      .filter(({ image }) => !isBehind(image))
      .sort(comparing(({ spriteName }) => getEquipmentData(spriteName).drawOrder));

    const sortedImages: ImageWithName[] = [...behindImages, unitImage, ...aheadImages];

    const updatedPaletteSwaps = {...entityToPaletteSwaps};
    let arePaletteSwapsUpdated = false;
    for (const { image, spriteName } of sortedImages) {
      const imageColors = getImageColors(image);
      if (!updatedPaletteSwaps[spriteName]) {
        arePaletteSwapsUpdated = true;
        updatedPaletteSwaps[spriteName] = {};
      }
      for (const color of imageColors) {
        updatedPaletteSwaps[spriteName][color] = updatedPaletteSwaps[spriteName][color] || color;
      }
    }

    if (arePaletteSwapsUpdated) {
      onChange && onChange({
        target: {
          name: 'paletteSwaps',
          type: 'other',
          value: updatedPaletteSwaps
        }
      });
    }

    const drawPromises = sortedImages.map(({ image, spriteName }) => {
      const spritePaletteSwaps: Record<string, (string | number[])> = entityToPaletteSwaps[spriteName] || {};
      spritePaletteSwaps['#ffffff'] = [0, 0, 0, 0];
      return replaceColors(image, spritePaletteSwaps);
    });

    Promise.all(drawPromises).then(swappedImages => {
      for (const swappedImage of swappedImages) {
        context.drawImage(swappedImage, 0, 0);
      }

      const imageBlob = canvas.toDataURL('image/png').split('base64,')[1];
      const outputFilename = getShortFilename(unit.spriteName, activity, direction, frameNumber);
      onImageLoaded && onImageLoaded(outputFilename, imageBlob);
    });
  };

  _getImages = (): HTMLImageElement[] => {
    const container = this.container;
    if (container) {
      // @ts-ignore
      return [...container.querySelectorAll('img')];
    }
    return [];
  };

  _renderCanvas = () => {
    this.loadedImages = [];

    const { canvas } = this;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    context.imageSmoothingEnabled = false;
    const scaleX = (canvas.width / 40);
    const scaleY = (canvas.height / 40);
    context.setTransform(scaleX, 0, 0, scaleY, 0, 0);

    for (const image of this._getImages()) {
      if (image.complete) {
        this._onImageLoaded(image);
      } else {
        image.onload = () => this._onImageLoaded(image);
      }
    }
  };

  _swapToBehindImage = (e: any) => {
    e.target.src = e.target.getAttribute('data-behind');
    this._renderCanvas();
  };

  componentDidMount = () => this._renderCanvas();

  componentDidUpdate = () => this._renderCanvas();
}

export default CompositeSprite;
