window.jwb = window.jwb || {};

{
  const { UNIT_DATA, EQUIPMENT_DATA, hasData, getImageFilename, replaceColor, isBehind, comparing, generateDownloadLink } = window.jwb.utils;

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
        equipment,
        dataBlob: null
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
                <div className="preview">
                  <CompositeSprite
                    unit={this.state.unit}
                    equipment={this.state.equipment}
                    activity={this.state.activity}
                    direction={this.state.direction}
                    frameNumber={this.state.frameNumber}
                    width={160}
                    height={160}
                  />
                </div>
              </td>
            </tr>
            {/* Render full sprite table */}
            <tr>
              <td colSpan="2">
                <div className="spriteSheet">
                  {
                    Object.entries(UNIT_DATA[this.state.unit].activities)
                      .map(([activity, { directions, frameNumbers }]) =>
                        frameNumbers.map(frameNumber =>
                          directions.map(direction =>
                            <CompositeSprite
                              unit={this.state.unit}
                              equipment={this.state.equipment}
                              activity={activity}
                              direction={direction}
                              frameNumber={frameNumber}
                              width={40}
                              height={40}
                            />
                          )
                        )
                      )
                  }
                </div>
              </td>
            </tr>
            {/* Render save button */}
            <tr>
              <td colSpan="2">
                {
                  <button onClick={() => this.downloadZip()}>
                    Download!
                  </button>
                }
                {
                  this.state.dataLink && (
                    <a href={this.state.dataLink} download="sprites.zip">Download</a>
                  )
                }
              </td>
            </tr>
          </table>
        </div>
      );
    }

    downloadZip() {
      generateDownloadLink().then(content => {
        const dataLink = "data:application/zip;base64," + content;

        // SUUUUUPER HACK ALERT
        const a = document.createElement('a');
        a.href = dataLink;
        a.download = 'sprites.zip';

        a.hidden = true;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
    }
  }

  window.jwb = { SpriteTool };
}