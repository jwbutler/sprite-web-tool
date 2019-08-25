{
  /**
   * @typedef {{
   *   spriteName: string,
   *   spriteNames: Array<string>,
   *   paletteSwaps: Object<string, string>,
   *   onChange: function(Event, void)
   * }}
   */
  let Props;

  class PaletteSwapPanel extends React.PureComponent {

    /**
     * @param {Props} props
     */
    constructor(props) {
      super(props);
      this.state = {
        spriteName: props.spriteNames[0]
      }
    }

    render() {
      const { spriteNames, paletteSwaps, onChange } = this.props;
      const { spriteName } = this.state;
      const spritePaletteSwaps = paletteSwaps[spriteName] || {};
      console.log(paletteSwaps);

      return (
        <div className="PaletteSwapPanel">
          <select name="spriteName" onChange={e => { this.setState({ spriteName: e.target.value }); }}>
            {
              spriteNames.map(spriteName => (
                <option name={spriteName} key={spriteName}>
                  {spriteName}
                </option>
              ))
            }
          </select>

          {
            Object.entries(spritePaletteSwaps)
              .filter(([source, dest]) => source !== '#ffffff')
              .map(([source, dest]) => (
                <div className="row" key={source}>
                  <div className="swatch" style={{ backgroundColor: source }} />
                  <input
                    type="color"
                    value={spritePaletteSwaps[source]}
                    onChange={e => {
                      this._onChangePaletteSwaps(source, e.target.value);
                    }}
                  />
                </div>
              ))
          }
        </div>
      );
    }

    _onChangePaletteSwaps(source, dest) {
      const { spriteName } = this.state;
      const paletteSwaps = { ... this.props.paletteSwaps };
      paletteSwaps[spriteName] = paletteSwaps[spriteName] || {};
      paletteSwaps[spriteName][source] = dest;

      // Super hack
      this.props.onChange({
        target: {
          name: 'paletteSwaps',
          value: paletteSwaps
        }
      });
    }
  }

  window.jwb.PaletteSwapPanel = PaletteSwapPanel;
}