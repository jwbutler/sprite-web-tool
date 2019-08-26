window.jwb = window.jwb || {};

{
  const {
    UNIT_DATA,
    EQUIPMENT_DATA,
    getImageFilename,
    getShortFilename,
    replaceColors,
    isBehind,
    comparing
  } = window.jwb.utils;

  const UnitImage = ({ spriteName, activity, direction, frameNumber, paletteSwaps }) => (
    <img
      className="hidden"
      src={getImageFilename(spriteName, activity, direction, frameNumber, false)}
      key={spriteName}
      data-spriteName={spriteName}
      data-activity={activity}
      data-direction={direction}
      data-frameNumber={frameNumber}
      data-paletteSwaps={JSON.stringify(paletteSwaps)}
    />
  );

  const EquipmentImage = ({ spriteName, activity, direction, frameNumber, paletteSwaps, onError }) => (
    <img
      className="hidden"
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

  /**
   * @typedef {{
   *   unit: string,
   *   equipment: Array<string>,
   *   activity: string,
   *   direction: string,
   *   frameNumber: string | number,
   *   paletteSwaps: Object<string, string>,
   *   width: number,
   *   height: number,
   *   onChange: function(event): void,
   *   onImageLoaded: ?function(string, string): void
   * }}
   */
  let Props;

  class CompositeSprite extends React.PureComponent {
    /**
     * @param {Props} props
     */
    constructor(props) {
      super(props);
      this.loadedImages = [];
    }

    render() {
      const { unit, equipment, activity, direction, frameNumber, paletteSwaps, width, height } = this.props;
      return (
        <span ref={e => this.container = e}>
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
                onError={e => this._swapToBehindImage(e)}
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

    _onImageLoaded(image) {
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
      const { getImageColors } = window.jwb.utils;
      const { canvas, container } = this;
      const { unit,  activity, direction, frameNumber, paletteSwaps, onChange, onImageLoaded } = this.props;

      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const images = [...container.querySelectorAll('img.hidden')];

      const behindImages = images.filter(image => isBehind(image))
        .sort(comparing(image => EQUIPMENT_DATA[image.getAttribute('data-spriteName')].drawOrder));
      const unitImage = images.filter(image => UNIT_DATA[image.getAttribute('data-spriteName')])[0];
      const aheadImages = images.filter(image => !UNIT_DATA[image.getAttribute('data-spriteName')])
        .filter(image => !isBehind(image))
        .sort(comparing(image => EQUIPMENT_DATA[image.getAttribute('data-spriteName')].drawOrder));

      const sortedImages = [...behindImages, unitImage, ...aheadImages];
      this.props.width > 50 && console.log('sortedImages=' + sortedImages.map(i => i.getAttribute('data-spriteName')));

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
      const context = canvas.getContext('2d');

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

    _swapToBehindImage(e) {
      //e.target.onload = () => this._onImageLoaded(e.target);
      e.target.src = e.target.getAttribute('data-behind');
      this._renderCanvas();
    };

    componentDidMount() {
      this._renderCanvas();
      this.props.width > 50 && console.log('mount');
    }

    componentDidUpdate() {
      this._renderCanvas();
      this.props.width > 50 && console.log('update');
    }
  }

  window.jwb.CompositeSprite = CompositeSprite;
}