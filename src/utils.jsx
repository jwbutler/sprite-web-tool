window.jwb = window.jwb || {};

{
  const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const UNIT_DATA = {
    player: {
      equipment: ['mail', 'sword', 'shield', 'shield2', 'shield3', 'hat', 'hat2', 'hairpiece', 'beard', 'helmet', 'helm2', 'spear', 'club', 'cloak'],
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
    zombie: {
      equipment: [],
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
      spriteDirectory: 'units/zombie',
    },
    /*robed_wizard: {
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
      },
      spriteDirectory: 'units/robed_wizard',
    },*/
  };

  const EQUIPMENT_DATA = {
    mail: {
      spriteDirectory: 'equipment/mail',
      drawOrder: 0,
    },
    sword: {
      spriteDirectory: 'equipment/sword',
      drawOrder: 1,
    },
    shield: {
      spriteDirectory: 'equipment/shield',
      drawOrder: 2,
    },
    shield2: {
      spriteDirectory: 'equipment/shield2',
      drawOrder: 2,
    },
    shield3: {
      spriteDirectory: 'equipment/shield3',
      drawOrder: 2,
    },
    hat: {
      spriteDirectory: 'equipment/hat',
      drawOrder: 4,
    },
    hat2: {
      spriteDirectory: 'equipment/hat2',
      drawOrder: 4,
    },
    helmet: {
      spriteDirectory: 'equipment/helmet',
      drawOrder: 4,
    },
    helm2: {
      spriteDirectory: 'equipment/helm2',
      drawOrder: 4,
    },
    spear: {
      spriteDirectory: 'equipment/spear',
      drawOrder: 1,
    },
    club: {
      spriteDirectory: 'equipment/club',
      drawOrder: 1,
    },
    cloak: {
      spriteDirectory: 'equipment/cloak',
      drawOrder: 0,
    },
    hairpiece: {
      spriteDirectory: 'equipment/hat',
      drawOrder: 3,
    },
    beard: {
      spriteDirectory: 'equipment/beard',
      drawOrder: 3,
    }
  };

  const hasData = (image) => {
    // TODO better way to do this?
    return image.width && image.height;
  };

  /**
   * @private
   */
  const _getSpriteDirectory = (spriteName) => {
    if (UNIT_DATA[spriteName]) {
      return `png/${UNIT_DATA[spriteName].spriteDirectory}`;
    } else if (EQUIPMENT_DATA[spriteName]) {
      return `png/${EQUIPMENT_DATA[spriteName].spriteDirectory}`;
    }
  };

  const getImageFilename = (spriteName, activity, direction, frameNumber, behind) => {
    const directory = _getSpriteDirectory(spriteName);
    return `${directory}/${spriteName}_${activity}_${direction}_${frameNumber}${behind ? '_B' : ''}.png`;
  };

  const getShortFilename = (spriteName, activity, direction, frameNumber, behind) => {
    return `${spriteName}_${activity}_${direction}_${frameNumber}${behind ? '_B' : ''}.png`;
  };

  /**
   * @private
   */
  const _zeroPad = (string, length) => {
    while (string.length < length) {
      string = `0${string}`;
    }
    return string;
  };

  const rgb2hex = (r, g, b) => `#${_zeroPad(r.toString(16), 2)}${_zeroPad(g.toString(16), 2)}${_zeroPad(b.toString(16), 2)}`;

  /**
   * @param {String} hex e.g. '#abcdef'
   * @return {Array<int>} [r, g, b, 255]
   */
  const hex2rgba = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b, 255];
  };

  /**
   * @param {HTMLImageElement} image
   * @param {Object} colorMap A map of (hex => hex) OR (hex => [r, g, b, a])
   * @return Promise<HTMLImageElement>
   */
  const replaceColors = (image, colorMap) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        Object.entries(colorMap).forEach(([source, dest]) => {
          const sourceRGBA = hex2rgba(source);
          if ([0, 1, 2, 3].every(j => (imageData.data[i + j] === sourceRGBA[j]))) {
            const destRGBA = (dest[0] === '#' ? hex2rgba(dest) : dest);
            [0, 1, 2, 3].forEach(j => {
              imageData.data[i + j] = destRGBA[j];
            });
          }
        });
      }
      context.putImageData(imageData, 0, 0);

      const swappedImage = document.createElement('img');
      swappedImage.src = canvas.toDataURL('image/png');
      swappedImage.onload = () => resolve(swappedImage);
    });
  };

  /**
   * Apparently we can't directly compare src vs. data-behind because src can have file:/// prepended to it.
   * @returns {boolean} whether the image should be drawn behind the unit sprite
   * @private
   */
  const isBehind = (image) => {
    if (!image.getAttribute('data-behind')) {
      return false;
    }
    const srcParts = image.src.split('/');
    const behindParts = image.getAttribute('data-behind').split('/');
    return srcParts[srcParts.length - 1] === behindParts[behindParts.length - 1];
  };

  const comparing = (keyFunction) => ((a, b) => keyFunction(a) - keyFunction(b));

  /**
   * @returns {Promise<Blob>}
   */
  const generateDownloadLink = () => {
    const canvases = document.querySelectorAll('canvas[data-blob][data-filename]');
    const zip = new JSZip();
    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      zip.file(canvas.getAttribute('data-filename'), canvas.getAttribute('data-blob'), { base64: true });
    }
    return zip.generateAsync({ type: 'base64' });
  };

  /**
   * TODO: Assumes that any one frame will have all the colors for every animation.
   *
   * @param {HTMLImageElement} image
   */
  const getImageColors = (image) => {
    const colors = {};
    const tmpCanvas = document.createElement('canvas');
    const tmpContext = tmpCanvas.getContext('2d');
    tmpCanvas.width = image.width;
    tmpCanvas.height = image.height;
    tmpContext.drawImage(image, 0, 0);
    const imageData = tmpContext.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const [r, g, b, a] = imageData.data.slice(i, i + 4);
      const hex = rgb2hex(r, g, b);
      colors[hex] = hex;
    }
    return Object.values(colors);
  };

  /**
   * @return {Promise<HTMLImageElement>}
   */
  const getAnyFrame = (spriteName) => {
    let activities;
    if (UNIT_DATA.hasOwnProperty(spriteName)) {
      activities = UNIT_DATA[spriteName].activities;
    } else { // equipment
      const unitName = Object.keys(UNIT_DATA).find(u => UNIT_DATA[u].equipment.indexOf(spriteName) > -1);
      activities = UNIT_DATA[unitName].activities;
    }
    const activity = Object.keys(activities)[0];
    const direction = activities[activity].directions[0];
    const frameNumber = activities[activity].frameNumbers[0];

    const baseFilename = getImageFilename(spriteName, activity, direction, frameNumber, false);
    const behindFilename = getImageFilename(spriteName, activity, direction, frameNumber, true);

    return new Promise((resolve, reject) => {
      const img = document.createElement('img');

      img.src = baseFilename;
      img.onload = () => resolve(img);
      img.onerror = () => {
        img.src = behindFilename;
        resolve(img);
      };
    })
  };

  window.jwb.utils = {
    UNIT_DATA,
    EQUIPMENT_DATA,
    hasData,
    getImageFilename,
    getShortFilename,
    replaceColors,
    isBehind,
    comparing,
    generateDownloadLink,
    getAnyFrame,
    getImageColors,
    rgb2hex,
    hex2rgba
  };
}