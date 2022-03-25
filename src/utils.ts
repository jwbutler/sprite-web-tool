import JSZip from 'jszip';

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

type Activity = {
  directions: string[],
  frameNumbers: (string | number)[];
}

type UnitData = {
  equipment: string[],
  activities: Record<string, Activity>,
  spriteDirectory: string
};

type EquipmentData = {
  spriteDirectory: string,
  drawOrder: number
};

const UNIT_DATA: Record<string, UnitData> = {
  player: {
    equipment: ['bow', 'beard', 'cloak', 'club', 'crown', 'hat', 'hat2', 'helmet', 'helm2', 'mail', 'shield', 'shield2', 'shield3', 'sword'], // TODO SPEAR
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
        frameNumbers: [1, 2]
      }
    },
    spriteDirectory: 'units/zombie',
  },
  female: {
    equipment: ['sword_female', 'skirt'],
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
    spriteDirectory: 'units/female'
  }
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

const EQUIPMENT_DATA: Record<string, EquipmentData> = {
  beard: {
    spriteDirectory: 'equipment/beard',
    drawOrder: 3,
  },
  bow: {
    spriteDirectory: 'equipment/bow',
    drawOrder: 1,
  },
  cloak: {
    spriteDirectory: 'equipment/cloak',
    drawOrder: 0,
  },
  club: {
    spriteDirectory: 'equipment/club',
    drawOrder: 1,
  },
  crown: {
    spriteDirectory: 'equipment/crown',
    drawOrder: 4,
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
  mail: {
    spriteDirectory: 'equipment/mail',
    drawOrder: 0,
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
  skirt: {
    spriteDirectory: 'equipment/skirt',
    drawOrder: 0,
  },
  spear: {
    spriteDirectory: 'equipment/spear',
    drawOrder: 1,
  },
  sword: {
    spriteDirectory: 'equipment/sword',
    drawOrder: 1,
  },
  sword_female: {
    spriteDirectory: 'equipment/sword_female',
    drawOrder: 1,
  }
};

const hasData = (image: HTMLImageElement) => {
  // TODO better way to do this?
  return image.width && image.height;
};

/**
 * @private
 */
const _getSpriteDirectory = (spriteName: string): string => {
  if (UNIT_DATA[spriteName]) {
    return `png/${UNIT_DATA[spriteName].spriteDirectory}`;
  } else if (EQUIPMENT_DATA[spriteName]) {
    return `png/${EQUIPMENT_DATA[spriteName].spriteDirectory}`;
  }
  throw new Error();
};

const getImageFilename = (spriteName: string, activity: string, direction: string, frameNumber: number | string, behind: boolean) => {
  const directory = _getSpriteDirectory(spriteName);
  return `${directory}/${spriteName}_${activity}_${direction}_${frameNumber}${behind ? '_B' : ''}.png`;
};

const getShortFilename = (spriteName: string, activity: string, direction: string, frameNumber: number | string, behind: boolean) => {
  return `${spriteName}_${activity}_${direction}_${frameNumber}${behind ? '_B' : ''}.png`;
};

/**
 * @private
 */
const _zeroPad = (string: string, length: number) => {
  while (string.length < length) {
    string = `0${string}`;
  }
  return string;
};

const rgb2hex = (r: number, g: number, b: number) => `#${_zeroPad(r.toString(16), 2)}${_zeroPad(g.toString(16), 2)}${_zeroPad(b.toString(16), 2)}`;

/**
 * @param hex e.g. '#abcdef'
 * @return [r, g, b, 255]
 */
const hex2rgba = (hex: string): number[] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
};

/**
 * @param {HTMLImageElement} image
 * @param {Object} colorMap A map of (hex => hex) OR (hex => [r, g, b, a])
 * @return
 */
const replaceColors = async (image: HTMLImageElement, colorMap: Record<string, string | number[]>): Promise<HTMLImageElement> => {
  const t1 = new Date().getTime();
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const rgbaSwaps = Object.entries(colorMap)
      .map(([source, dest]) => [hex2rgba(source), dest[0] === '#' ? hex2rgba(dest as string) : dest as number[]]);

    for (let i = 0; i < imageData.data.length; i += 4) {
      for (let j = 0; j < rgbaSwaps.length; j++) {
        const [source, dest] = rgbaSwaps[j];
        if ([0, 1, 2, 3].every(j => (imageData.data[i + j] === source[j]))) {
          [0, 1, 2, 3].forEach(j => {
            imageData.data[i + j] = dest[j];
          });
          break;
        }
      }
    }
    context.putImageData(imageData, 0, 0);

    const swappedImage = document.createElement('img');
    swappedImage.src = canvas.toDataURL('image/png');
    swappedImage.onload = () => {
      const t2 = new Date().getTime();
      resolve(swappedImage);
    };
  });
};

/**
 * Apparently we can't directly compare src vs. data-behind because src can have file:/// prepended to it.
 */
const isBehind = (image: HTMLImageElement): boolean => {
  if (!image.getAttribute('data-behind')) {
    return false;
  }
  const srcParts = image.src.split('/');
  const behindParts = image.getAttribute('data-behind')?.split('/');
  return behindParts && (srcParts[srcParts.length - 1] === behindParts[behindParts.length - 1]) || false;
};

const comparing = <T,U> (keyFunction: (t: T) => number) => ((a: T, b: T) => keyFunction(a) - keyFunction(b));

const generateDownloadLink = async (filenameToBlob: Record<string, string>): Promise<string> => {
  const zip = new JSZip();
  Object.entries(filenameToBlob).forEach(([filename, blob]) =>{
    zip.file(filename, blob, { base64: true });
  });
  return zip.generateAsync({ type: 'base64' });
};

/**
 * TODO: Assumes that any one frame will have all the colors for every animation.
 */
const getImageColors = (image: HTMLImageElement): string[] => {
  const colors: Record<string, string> = {};
  const tmpCanvas = document.createElement('canvas');
  const tmpContext = tmpCanvas.getContext('2d') as CanvasRenderingContext2D;
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

const getAnyFrame = async (spriteName: string): Promise<HTMLImageElement> => {
  let activities;
  if (UNIT_DATA.hasOwnProperty(spriteName)) {
    activities = UNIT_DATA[spriteName].activities;
  } else { // equipment
    const unitName = Object.keys(UNIT_DATA).find(u => UNIT_DATA[u].equipment.indexOf(spriteName) > -1) as string;
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
  });
};

const arrayEquals = (first: any[], second: any[]) => {
  return (
    first.every(e => second.indexOf(e) > -1)
    && second.every(e => first.indexOf(e) > -1)
  );
};

/**
 * Still pretty shallow
 */
const objectEquals = (first: any, second: any) => {
  return (
    Object.entries(first).every(([k, v]) => second[k] === v)
    && Object.entries(second).every(([k, v]) => first[k] === v)
  );
};

export {
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
  hex2rgba,
  arrayEquals,
  objectEquals
};
