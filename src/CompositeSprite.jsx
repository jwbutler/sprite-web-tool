window.jwb = window.jwb || {};

{
  const { UNIT_DATA, EQUIPMENT_DATA, hasData, getImageFilename, getShortFilename, replaceColors, isBehind, comparing } = window.jwb.utils;

  const UnitImage = ({ spriteName, activity, direction, frameNumber }) => (
    <img
      className="hidden"
      src={getImageFilename(spriteName, activity, direction, frameNumber, false)}
      key={spriteName}
      data-spriteName={spriteName}
      data-activity={activity}
      data-direction={direction}
      data-frameNumber={frameNumber}
    />
  );

  const EquipmentImage = ({ spriteName, activity, direction, frameNumber }) => (
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
      const { unit, equipment, activity, direction, frameNumber, width, height } = this.props;
      return (
        <span ref={e => this.container = e}>
          <UnitImage
            spriteName={unit}
            activity={activity}
            direction={direction}
            frameNumber={frameNumber}
          />
          {
            equipment.map(spriteName => (
              <EquipmentImage
                spriteName={spriteName}
                activity={activity}
                direction={direction}
                frameNumber={frameNumber}
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
      sortedImages.forEach(image => {
        image = replaceColors(image, { '#ff0000': [0, 0, 0, 0] });
        context.drawImage(image, 0, 0);
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
      context.fillStyle = '#ffffff';
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