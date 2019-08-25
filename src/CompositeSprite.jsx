window.jwb = window.jwb || {};

{
  const {
    UNIT_DATA,
    EQUIPMENT_DATA,
    hasData,
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

  const EquipmentImage = ({ spriteName, activity, direction, frameNumber, paletteSwaps }) => (
    <img
      className="hidden"
      src={getImageFilename(spriteName, activity, direction, frameNumber, false)}
      key={spriteName}
      onError={e => { e.target.src = e.target.getAttribute('data-behind'); }}
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
   *   onChange: function(event): void
   * }}
   */
  let Props;

  class CompositeSprite extends React.PureComponent {
    /**
     * @param {Props} props
     */
    constructor(props) {
      super(props);

      this.state = {
        compositeImage: null,
        outputFilename: null
      };
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
              />
            ))
          }
          <span className="metadata">

          </span>
          <canvas
            width={width}
            height={height}
            ref={canvas => { this.canvas = canvas; }}
            data-blob={this.state.compositeImage}
            data-filename={this.state.outputFilename}
          />
        </span>
      );
    }

    _onImageLoaded(image) {
      if (!hasData(image)) {
        image.onload = () => this._onImageLoaded(image);
        image.src = image.getAttribute('data-behind');
      } else {
        if (this._getImages().every(i => i.complete)) {
          this._drawImages();
        }
      }
    }

    _drawImages() {
      const { getImageColors } = window.jwb.utils;
      const { canvas, container } = this;
      const { unit,  activity, direction, frameNumber, paletteSwaps, onChange } = this.props;

      const context = canvas.getContext('2d');
      const images = [...container.querySelectorAll('img.hidden')]
        .filter(image => hasData(image, canvas, context));

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

        const compositeImage = canvas.toDataURL('image/png').split('base64,')[1];
        const outputFilename = getShortFilename(unit, activity, direction, frameNumber);

        this.setState({ compositeImage, outputFilename });
      });
    };

    _getImages() {
      return [...this.container.querySelectorAll('img')];
    }

    _renderCanvas() {
      const { canvas } = this;
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = false;
      const scaleX = (canvas.width / 40);
      const scaleY = (canvas.height / 40);
      context.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      this._getImages().forEach(image => {
        if (image.complete) {
          this._onImageLoaded(image);
        } else {
          image.onload = () => this._onImageLoaded(image);
        }
      }, this);
    };

    componentDidMount() {
      this._renderCanvas();
      (this.props.width > 50) && console.log('mount ' + new Date().getTime());
    }

    componentDidUpdate() {
      this._renderCanvas();
      (this.props.width > 50) && console.log('update ' + new Date().getTime());
    }
  }

  window.jwb.CompositeSprite = CompositeSprite;
}