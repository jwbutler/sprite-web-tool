window.jwb = window.jwb || {};

{
  const { UNIT_DATA, EQUIPMENT_DATA, hasData, getImageFilename, replaceColor, isBehind, comparing } = window.jwb.utils;

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
                <div className="previewContainer" ref={div => this.previewContainer = div}>
                  <img
                    name={this.state.unit}
                    src={getImageFilename(this.state.unit, this.state.activity, this.state.direction, this.state.frameNumber)}
                  />
                  {
                    this.state.equipment.map(spriteName => (
                      <EquipmentImage
                        spriteName={spriteName}
                        activity={this.state.activity}
                        direction={this.state.direction}
                        frameNumber={this.state.frameNumber}
                      />
                    ))
                  }
                  <canvas ref={canvas => this.canvas = canvas} />
                </div>
              </td>
            </tr>
            {/* Render full sprite sheet */}
            <tr>
              <td colspan="2">
                <div>
                  Sprite Sheet
                </div>
                <div className="spriteSheetContainer" ref={div => this.spriteSheetContainer = div}>
                  {
                    // Render each image for the unit
                    Object.entries(UNIT_DATA[this.state.unit].activities)
                      .map(([activity, {directions, frameNumbers}]) => (
                        <div>
                          {
                            frameNumbers.map(frameNumber =>
                              directions.map(direction =>
                                <img
                                  name={`${this.state.unit}_${activity}_${direction}_${frameNumber}`}
                                  src={getImageFilename(this.state.unit, activity, direction, frameNumber)}
                                />
                              )
                            )
                          }
                        </div>
                      ))
                  }
                  {
                    // Render each image each equipment item
                    this.state.equipment.map(item =>
                      Object.entries(UNIT_DATA[this.state.unit].activities)
                        .map(([activity, {directions, frameNumbers}]) => (
                          <div>
                            {
                              frameNumbers.map(frameNumber =>
                                directions.map(direction =>
                                  <EquipmentImage
                                    spriteName={item}
                                    activity={activity}
                                    direction={direction}
                                    frameNumber={frameNumber}
                                  />
                                )
                              )
                            }
                          </div>
                        ))
                    )
                  }
                </div>
              </td>
            </tr>
          </table>
        </div>
      );
    }

    componentDidMount() {
      this.renderPreview();
    }

    componentDidUpdate() {
      this.renderPreview();
    }

    renderPreview() {
      const { canvas, previewContainer } = this;
      const context = canvas.getContext('2d', { antialias: false });
      context.imageSmoothingEnabled = false;
      context.setTransform(4, 0, 0, 4, 0, 0); // i. e. scale by (4x, 4x)
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      const images = [...previewContainer.querySelectorAll('img')];
      images.forEach(image => {
        if (image.complete) {
          this._onImageLoad(image, canvas, context);
        } else {
          image.onload = () => this._onImageLoad(image, canvas, context);
        }
      });
    };

    _drawImages(canvas, context) {
      const { previewContainer } = this;
      const images = [...previewContainer.querySelectorAll('img')]
        .filter(image => hasData(image, canvas, context));

      const behindImages = images.filter(image => isBehind(image))
        .sort((comparing(image => EQUIPMENT_DATA[image.name].drawOrder)));
      const unitImage = images.filter(image => UNIT_DATA[image.name])[0];
      const aheadImages = images.filter(image => !UNIT_DATA[image.name])
        .filter(image => !isBehind(image))
        .sort((comparing(image => EQUIPMENT_DATA[image.name].drawOrder)));

      const sortedImages = [...behindImages, unitImage, ...aheadImages];
      sortedImages.forEach(image => {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
        const tmpContext = tmpCanvas.getContext('2d');
        tmpContext.drawImage(image, 0, 0);
        replaceColor(tmpCanvas, tmpContext, [255, 255, 255, 255], [0, 0, 0, 0]);
        context.drawImage(tmpCanvas, 0, 0);
      });
    }

    _onImageLoad(image, canvas, context) {
      if (!hasData(image)) {
        image.onload = () => this._onImageLoad(image, canvas, context);
        image.src = image.getAttribute('data-behind');
      } else {
        this._drawImages(canvas, context);
      }
    }
  }

  const EquipmentImage = ({ spriteName, activity, direction, frameNumber }) => (
    <img
      name={spriteName}
      src={getImageFilename(spriteName, activity, direction, frameNumber, false)}
      key={spriteName}
      onError={e => e.target.src = e.target.getAttribute('data-behind')}
      data-behind={getImageFilename(spriteName, activity, direction, frameNumber, true)}
    />
  );

  window.jwb = { SpriteTool };
}