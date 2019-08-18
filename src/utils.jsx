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
      drawOrder: 0,
    },
    sword: {
      spriteDirectory: 'equipment/sword',
      drawOrder: 1,
    },
    shield2: {
      spriteDirectory: 'equipment/shield2',
      drawOrder: 2,
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

  const replaceColor = (canvas, context, source, target) => {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      if ([0, 1, 2, 3].every(j => (imageData.data[i + j] === source[j]))) {
        [0, 1, 2, 3].forEach(j => {
          imageData.data[i + j] = target[j];
        });
      }
    }
    context.putImageData(imageData, 0, 0);
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

  window.jwb.utils = { UNIT_DATA, EQUIPMENT_DATA, hasData, getImageFilename, replaceColor, isBehind, comparing };
}