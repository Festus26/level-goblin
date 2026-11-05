import cog from '../art/cog.svg';
import coinSack from '../art/coin-sack.svg';
import die1 from '../art/die-1.svg';
import die2 from '../art/die-2.svg';
import die3 from '../art/die-3.svg';
import die4 from '../art/die-4.svg';
import die5 from '../art/die-5.svg';
import die6 from '../art/die-6.svg';
import goblinGreedy from '../art/goblin-greedy.svg';
import goblinGrin from '../art/goblin-grin.svg';
import goblinGulp from '../art/goblin-gulp.svg';
import helmet from '../art/helmet.svg';
import helpers from '../art/helpers.svg';
import levelBadge from '../art/level-badge.svg';
import monster from '../art/monster.svg';
import scroll from '../art/scroll.svg';
import signpost from '../art/signpost.svg';
import sword from '../art/sword.svg';

const ART = {
  cog,
  coinSack,
  goblinGreedy,
  goblinGrin,
  goblinGulp,
  helmet,
  helpers,
  levelBadge,
  monster,
  scroll,
  signpost,
  sword,
};

export type ArtName = keyof typeof ART;

const DICE = [die1, die2, die3, die4, die5, die6];

interface ArtProps {
  name: ArtName;
  size?: number;
}

/** Decorative art. Text beside it always carries the meaning, so alt stays empty. */
export function Art({ name, size = 28 }: ArtProps) {
  return <img src={ART[name]} alt="" width={size} height={size} draggable={false} />;
}

export function Die({ value, size = 28 }: { value: number; size?: number }) {
  return <img src={DICE[value - 1]} alt="" width={size} height={size} draggable={false} />;
}
