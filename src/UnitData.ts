import Activity from './Activity';

type UnitData = {
  equipment: string[],
  activities: Record<string, Activity>,
  spriteDirectory: string
};

export default UnitData;
