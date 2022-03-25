import Activity from '../Activity';

type UnitModel = {
  spriteName: string,
  equipment: string[],
  activities: Record<string, Activity>,
  spriteDirectory: string
};

export default UnitModel;
