import React from 'react';
import styles from './PaletteSwapPanel.css';

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

    return (
      <div className={styles.PaletteSwapPanel}>
        <select name="spriteName" onChange={e => { this.setState({ spriteName: e.target.value }); }}>
          {
            spriteNames.map(spriteName => (
              <option name={spriteName} key={spriteName}>
                {spriteName}
              </option>
            ))
          }
        </select>
        <div className={styles.table}>
          {
            Object.entries(spritePaletteSwaps)
              .filter(([source, dest]) => source !== '#ffffff')
              .map(([source, dest]) => (
                <div className={styles.row} key={source}>
                  <div className={styles.col}>
                    <div className={styles.swatch} style={{ backgroundColor: source }} />
                  </div>
                  <div className={styles.col}>
                    <input
                      type="color"
                      value={spritePaletteSwaps[source]}
                      onChange={e => {
                        this._onChangePaletteSwaps(source, e.target.value);
                      }}
                    />
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    );
  }

  componentDidMount() {
    const { spriteName } = this.state;
    const { spriteNames } = this.props;
    if (spriteNames.indexOf(spriteName) === -1) {
      this.setState({ spriteName: spriteNames[0] });
      console.log(spriteNames[0]);
    }
  }

  componentDidUpdate() {
    const { spriteName } = this.state;
    const { spriteNames } = this.props;
    if (spriteNames.indexOf(spriteName) === -1) {
      this.setState({ spriteName: spriteNames[0] });
      console.log(spriteNames[0]);
    }
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

export default PaletteSwapPanel;
