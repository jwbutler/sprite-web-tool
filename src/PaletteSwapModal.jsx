window.jwb = window.jwb || {};

{
  const { getAnyFrame, getImageColors, rgb2hex, replaceColors } = window.jwb.utils;

  class PaletteSwapModal extends React.PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        colorMap: {},
        baseImage: null,
        swappedImage: null
      }
    }

    render() {
      return (
        <div className="PaletteSwapModal">
          <div className="spritePane">
            {/* Can't use this.state.baseImage directly because React /shrug */}
            {/*
              this.state.baseImage && (
                <img src={this.state.baseImage.src} />
              )
            */}
            {
              this.state.swappedImage && (
                <img src={this.state.swappedImage.src} />
              )
            }
          </div>
          <div className="colorPane">
            {
              Object.entries(this.state.colorMap)
                .map(([source, dest]) => {
                  return (
                    <div key={source}>
                      <div className="swatch" style={{ backgroundColor: source }} />
                      <input
                        type="color"
                        value={this.state.colorMap[source]}
                        onChange={e => {
                          this.setState({
                            colorMap: {
                              ...this.state.colorMap,
                              [source]: e.target.value
                            }
                          }, this._performPaletteSwaps);
                        }}
                      />
                    </div>
                  );
                })
            }
          </div>
        </div>
      );
    }

    componentDidMount() {
      const { spriteName } = this.props;

      getAnyFrame(spriteName)
        .then(image => {
          const imageColors = getImageColors(image);
          const colorMap = { ... this.state.colorMap };
          imageColors.forEach(color => { colorMap[color] = color; });
          this.setState({
            baseImage: image,
            swappedImage: image,
            colorMap
          });
        });
    }

    _performPaletteSwaps() {
      this.setState({
        swappedImage: replaceColors(this.state.baseImage, this.state.colorMap)
      })
    }
  }
}