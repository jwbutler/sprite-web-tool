// @ts-nocheck
// TODO

import React from 'react';
import styles from './SpriteTool.css'; // TODO should not use a global style sheet

import {
  comparing,
  EQUIPMENT_DATA, getImageColors,
  getImageFilename,
  getShortFilename,
  isBehind,
  replaceColors,
  UNIT_DATA
} from './utils';

const UnitImage = ({ spriteName, activity, direction, frameNumber, paletteSwaps }: any) => (
  <img
    className={styles.hidden}
    src={getImageFilename(spriteName, activity, direction, frameNumber, false)}
    key={spriteName}
    data-spriteName={spriteName}
    data-activity={activity}
    data-direction={direction}
    data-frameNumber={frameNumber}
    data-paletteSwaps={JSON.stringify(paletteSwaps)}
  />
);

const EquipmentImage = ({ spriteName, activity, direction, frameNumber, paletteSwaps, onError }: any) => (
  <img
    className={styles.hidden}
    src={getImageFilename(spriteName, activity, direction, frameNumber, false)}
    key={spriteName}
    onError={e => onError(e)}
    data-behind={getImageFilename(spriteName, activity, direction, frameNumber, true)}
    data-spriteName={spriteName}
    data-activity={activity}
    data-direction={direction}
    data-frameNumber={frameNumber}
    data-paletteSwaps={JSON.stringify(paletteSwaps)}
  />
);

type Props = {
  unit: string,
  equipment: string[],
  activity: string,
  direction: string,
  frameNumber: string | number,
  paletteSwaps: Record<string, Record<string, string>>,
  width: number,
  height: number,
  onChange?: (event: any) => void,
  onImageLoaded?: (first: string, second: string) => void /** TODO what are these params? */
}

class CompositeSprite extends React.PureComponent<Props> {
  private loadedImages: any[];
  private container: any;
  private canvas: HTMLCanvasElement | null;

  constructor(props: Props) {
    super(props);
    this.loadedImages = [];
  }

  render() {
    const { unit, equipment, activity, direction, frameNumber, paletteSwaps, width, height } = this.props;
    return (
      <span ref={e => { this.container = e; }}>
        <UnitImage
          spriteName={unit}
          activity={activity}
          direction={direction}
          frameNumber={frameNumber}
          paletteSwaps={paletteSwaps[unit]}
        />
        {
          equipment.map(spriteName => (
            <EquipmentImage
              spriteName={spriteName}
              activity={activity}
              direction={direction}
              frameNumber={frameNumber}
              paletteSwaps={paletteSwaps[spriteName]}
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
  }

  _onImageLoaded(image: any) {
    if (this.loadedImages.indexOf(image) === -1) {
      this.loadedImages.push(image);
    }

    if (this._getImages().every(i =>
      i.complete && this.loadedImages.indexOf(i) > -1
    )) {
      this._drawImages();
    }
  }


  _drawImages() {
    const { canvas, container } = this;
    const { unit,  activity, direction, frameNumber, paletteSwaps, onChange, onImageLoaded } = this.props;

    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const images: HTMLImageElement[] = [...container.querySelectorAll(`img.${styles.hidden}`)];

    const behindImages = images.filter(image => isBehind(image))
      .sort(comparing(image => EQUIPMENT_DATA[image.getAttribute('data-spriteName')].drawOrder));
    const unitImage = images.filter(image => UNIT_DATA[image.getAttribute('data-spriteName')])[0];
    const aheadImages = images.filter(image => !UNIT_DATA[image.getAttribute('data-spriteName')])
      .filter(image => !isBehind(image))
      .sort(comparing(image => EQUIPMENT_DATA[image.getAttribute('data-spriteName')].drawOrder));

    const sortedImages = [...behindImages, unitImage, ...aheadImages];

    const updatedPaletteSwaps = {...paletteSwaps};
    let arePaletteSwapsUpdated = false;
    sortedImages.forEach(image => {
      const spriteName = image.getAttribute('data-spriteName');
      const imageColors = getImageColors(image);
      if (!updatedPaletteSwaps[spriteName]) {
        arePaletteSwapsUpdated = true;
        updatedPaletteSwaps[spriteName] = {};
      }
      imageColors.forEach(color => {
        updatedPaletteSwaps[spriteName][color] = updatedPaletteSwaps[spriteName][color] || color;
      });
    });

    if (arePaletteSwapsUpdated) {
      onChange && onChange({
        target: {
          name: 'paletteSwaps',
          value: updatedPaletteSwaps
        }
      });
    }

    const drawPromises = sortedImages.map(image => {
      const spriteName = image.getAttribute('data-spriteName');
      const spritePaletteSwaps = paletteSwaps[spriteName] || {};
      spritePaletteSwaps['#ffffff'] = [0, 0, 0, 0];
      return replaceColors(image, spritePaletteSwaps);
    });

    Promise.all(drawPromises).then(swappedImages => {
      swappedImages.forEach(swappedImage => {
        context.drawImage(swappedImage, 0, 0);
      });

      const imageBlob = canvas.toDataURL('image/png').split('base64,')[1];
      const outputFilename = getShortFilename(unit, activity, direction, frameNumber);
      onImageLoaded && onImageLoaded(outputFilename, imageBlob);
    });
  };

  _getImages() {
    return [...this.container.querySelectorAll('img')];
  }

  _renderCanvas() {
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
    this._getImages().forEach(image => {
      if (image.complete) {
        this._onImageLoaded(image);
      } else {
        image.onload = () => this._onImageLoaded(image);
      }
    }, this);
  };

  _swapToBehindImage(e: any) {
    e.target.src = e.target.getAttribute('data-behind');
    this._renderCanvas();
  };

  componentDidMount() {
    this._renderCanvas();
  }

  componentDidUpdate() {
    this._renderCanvas();
  }
}

export default CompositeSprite;