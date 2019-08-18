window.jwb = window.jwb || {};

{
  const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const UNIT_DATA = {
    player: {
      equipment: ['mail', 'sword', 'shield2'],
      activities: {
        standing: {
          directions: DIRECTIONS,
          frameNumbers: [1]
        },
        walking: {
          directions: DIRECTIONS,
          frameNumbers: [1, 2]
        },
        attacking: {
          directions: DIRECTIONS,
          frameNumbers: [1, 2, '2b']
        }
      },
      spriteDirectory: 'units/player',
    },
    robed_wizard: {
      equipment: [],
      activities: {
        standing: {
          directions: ['SE'],
        },
        walking: {
          directions: DIRECTIONS
        },
        vanishing: ['SE'],
        stunned: ['SE']
      }
    },
    spriteDirectory: 'units/robed_wizard',
  };

  const EQUIPMENT_DATA = {
    mail: {
      spriteDirectory: 'equipment/mail',
    },
    sword: {
      spriteDirectory: 'equipment/sword',
    },
    shield2: {
      spriteDirectory: 'equipment/shield2',
    }
  };

  class SpriteTool extends React.PureComponent {
    constructor(props) {
      super(props);

      const unit = Object.keys(UNIT_DATA)[0];
      const activity = Object.keys(UNIT_DATA[unit].activities)[0];
      const direction = UNIT_DATA[unit].activities[activity].directions[0];
      const frameNumber = UNIT_DATA[unit].activities[activity].frameNumbers[0];
      const equipment = [];

      this.state = {
        unit,
        activity,
        direction,
        frameNumber,
        equipment
      };
    }

    onChange(e) {
      const field = e.target.name;
      const value = e.target.value;
      if (e.target.type === 'checkbox') {
        const fieldValue = [...this.state[field]];
        const index = fieldValue.indexOf(value);
        if (index > -1) {
          fieldValue.splice(index, 1);
        } else {
          fieldValue.push(value);
        }
        this.setState({ [field]: fieldValue });
        //this.forceUpdate(); // TODO Why do we need this? I hate React
      } else {
        this.setState({ [field]: value });
      }
    }

    render() {
      return (
        <div className="SpriteTool">
          <table>
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
                      <option name={spriteName} key={spriteName}>
                        {spriteName}
                      </option>
                    ))
                  }
                </select>
              </td>
            </tr>
            {/* Render activity selection */}
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
                      <option name={frameNumber} key={frameNumber}>
                        {frameNumber}
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
                <table>
                {
                  UNIT_DATA[this.state.unit].equipment.map(item => {
                    return (
                      <tr>
                        <td>
                          {item}
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            name="equipment"
                            value={item}
                            checked={this.state.equipment.indexOf(item) > -1}
                            onChange={e => this.onChange(e)}
                            key={item}
                          />
                        </td>
                      </tr>
                    );
                  })
                }
                </table>
              </td>
            </tr>
            {/* Render preview */}
            <tr>
              <td colSpan="2">
                <div>
                  Preview
                </div>
                <div className="imageContainer" ref={div => this.imageContainer = div}>
                  <img
                    name={this.state.unit}
                    src={this._getImageFilename(this.state.unit)}
                  />
                  {
                    this.state.equipment.map(item => (
                      <img
                        name={item}
                        src={this._getImageFilename(item)}
                        key={item}
                        onError={e => e.target.src = e.target.getAttribute('data-behind')}
                        data-behind={this._getImageFilename(item, true)}
                      />
                    ))
                  }
                  <canvas ref={canvas => this.canvas = canvas} />
                </div>
              </td>
            </tr>
          </table>
        </div>
      );
    }

    componentDidMount() {
     // this.spriteImages = {};
      this.renderPreview();
    }

    componentDidUpdate() {
      //this.spriteImages = {};
      this.renderPreview();
    }

    renderPreview() {
      const { canvas, imageContainer } = this;
      const context = canvas.getContext('2d', { antialias: false });
      context.imageSmoothingEnabled = false;
      context.setTransform(4, 0, 0, 4, 0, 0); // i. e. scale by (4x, 4x)
     // context.globalCompositeOperation = 'source-in';
      //context.globalCompositeOperation = "screen";
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      const images = [...imageContainer.querySelectorAll('img')];
      images.forEach(image => {
        if (image.complete) {
          console.log(`${image.src} complete`);
          this._onImageLoad(image, canvas, context);
        } else {
          console.log(`${image.src} not complete`);
          image.onload = () => this._onImageLoad(image, canvas, context);
        }
      });
    };

    _drawImages(canvas, context) {
      const { imageContainer } = this;
      const images = [...imageContainer.querySelectorAll('img')]
        .filter(image => this._hasData(image, canvas, context));

      const behindImages = images.filter(image => this._isBehind(image));
      const unitImage = images.filter(image => UNIT_DATA[image.name])[0];
      const aheadImages = images.filter(image => !UNIT_DATA[image.name])
        .filter(image => !this._isBehind(image));

      const sortedImages = [...behindImages, unitImage, ...aheadImages];
      sortedImages.forEach(image => {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
        const tmpContext = tmpCanvas.getContext('2d');
        tmpContext.drawImage(image, 0, 0);
        this._replaceColor(tmpCanvas, tmpContext, [255, 255, 255, 255], [0, 0, 0, 0]);
        context.drawImage(tmpCanvas, 0, 0);
      });
    }

    _onImageLoad(image, canvas, context) {
      if (!this._hasData(image)) {
        console.log(`${image.src} does not have data`);
        image.onload = () => this._onImageLoad(image, canvas, context);
        image.src = image.getAttribute('data-behind');
      } else {
        console.log(`${image.src} has data`);
        this._drawImages(canvas, context);
      }
    }

    _hasData(image) {
      // TODO better way to do this?
      return image.width && image.height;
    }

    _getImageFilename(spriteName, behind) {
      const { activity, direction, frameNumber } = this.state;
      const directory = this._getSpriteDirectory(spriteName);
      return `${directory}/${spriteName}_${activity}_${direction}_${frameNumber}${behind ? '_B' : ''}.png`;
    }

    _getSpriteDirectory(spriteName) {
      if (UNIT_DATA[spriteName]) {
        return `png/${UNIT_DATA[spriteName].spriteDirectory}`;
      } else if (EQUIPMENT_DATA[spriteName]) {
        return `png/${EQUIPMENT_DATA[spriteName].spriteDirectory}`;
      }
    }

    _replaceColor(canvas, context, source, target) {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        if ([0, 1, 2, 3].every(j => (imageData.data[i + j] === source[j]))) {
          [0, 1, 2, 3].forEach(j => {
            imageData.data[i + j] = target[j];
          });
        }
      }
      context.putImageData(imageData, 0, 0);
    }

    _isBehind(image) {
      if (!image.getAttribute('data-behind')) {
        return false;
      }
      const srcParts = image.src.split('/');
      const behindParts = image.getAttribute('data-behind').split('/');
      return srcParts[srcParts.length - 1] === behindParts[behindParts.length - 1];
    }
  }

  window.jwb = { SpriteTool };
}