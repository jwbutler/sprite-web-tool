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
      onError={e => e.target.src = e.target.getAttribute('data-behind')}
      data-behind={getImageFilename(spriteName, activity, direction, frameNumber, true)}
      data-spriteName={spriteName}
      data-activity={activity}
      data-direction={direction}
      data-frameNumber={frameNumber}
      data-paletteSwaps={JSON.stringify(paletteSwaps)}
    />
  );

  class CompositeSprite extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        compositeImage: null,
        outputFilename: null
      }
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

    drawImages() {
      const { canvas, container } = this;
      const { unit,  activity, direction, frameNumber } = this.props;
      const context = canvas.getContext('2d');
      const images = [...container.querySelectorAll('img.hidden')]
        .filter(image => hasData(image, canvas, context));

      const behindImages = images.filter(image => isBehind(image))
        .sort((comparing(image => EQUIPMENT_DATA[image.getAttribute('data-spriteName')].drawOrder)));
      const unitImage = images.filter(image => UNIT_DATA[image.getAttribute('data-spriteName')])[0];
      const aheadImages = images.filter(image => !UNIT_DATA[image.getAttribute('data-spriteName')])
        .filter(image => !isBehind(image))
        .sort((comparing(image => EQUIPMENT_DATA[image.getAttribute('data-spriteName')].drawOrder)));

      const sortedImages = [...behindImages, unitImage, ...aheadImages];

      /*sortedImages.forEach(image => {
        if (canvas.width > 50) {
          console.log(image.src, image.complete);
        }
        const paletteSwaps = JSON.parse(image.getAttribute('data-paletteSwaps')) || {};
        paletteSwaps['#ff0000'] = [0, 0, 0, 0];
        replaceColors(image, paletteSwaps)
          .then(swappedImage => context.drawImage(swappedImage, 0, 0));
      });*/

      const drawPromises = sortedImages.map(image => {
        const paletteSwaps = JSON.parse(image.getAttribute('data-paletteSwaps')) || {};
        paletteSwaps['#ffffff'] = [0, 0, 0, 0];
        return replaceColors(image, paletteSwaps);
      });

      Promise.all(drawPromises).then(swappedImages => {
        swappedImages.forEach(swappedImage => {
          if (canvas.width > 50) {
            console.log(swappedImage.src, swappedImage.complete);
          }
          context.drawImage(swappedImage, 0, 0);
        });
      });

      const compositeImage = canvas.toDataURL("image/png").split('base64,')[1];
      const outputFilename = getShortFilename(unit, activity, direction, frameNumber);

      this.setState({ compositeImage, outputFilename });

    };

    onImageLoad(image) {
      if (!hasData(image)) {
        image.onload = () => this.onImageLoad(image);
        image.src = image.getAttribute('data-behind');
      } else {
        this.drawImages();
      }
    }

    renderCanvas() {
      const { canvas, container } = this;
      const context = canvas.getContext('2d');
      context.imageSmoothingEnabled = false;
      const scaleX = (canvas.width / 40);
      const scaleY = (canvas.height / 40);
      context.setTransform(scaleX, 0, 0, scaleY, 0, 0);
      //context.fillStyle = '#ffffff';
      context.fillStyle = '#dddddd';
      context.fillRect(0, 0, canvas.width, canvas.height);
      const images = [...container.querySelectorAll('img')];
      images.forEach(image => {
        if (image.complete) {
          this.onImageLoad(image);
        } else {
          image.onload = () => this.onImageLoad(image);
        }
      }, this);
    };

    componentDidMount() {
      this.renderCanvas();
    }

    componentDidUpdate() {
      this.renderCanvas();
    }
  }

  window.jwb.CompositeSprite = CompositeSprite;
}