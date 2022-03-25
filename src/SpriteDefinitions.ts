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

const getShortFilename = (spriteName: string, activity: string, direction: string, frameNumber: number | string, behind?: boolean) => {
  return `${spriteName}_${activity}_${direction}_${frameNumber}${behind ? '_B' : ''}.png`;
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

const getDefaultUnit = () => Object.keys(UNIT_DATA)[0];

export default {
  getUnitData: (spriteName: string): UnitData => UNIT_DATA[spriteName],
  getEquipmentData: (spriteName: string): EquipmentData => EQUIPMENT_DATA[spriteName],
  getAnyFrame,
  getImageFilename,
  getShortFilename,
  getDefaultUnit,
  getAllUnitNames: (): string[] => Object.keys(UNIT_DATA)
};
