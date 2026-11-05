import { avatarMood, type AvatarMood, type GameState, type Player } from '@level-goblin/shared';
import { Art } from './Art.tsx';

const FILES = import.meta.glob<string>('../art/avatars/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

interface AvatarProps {
  avatar: string | null | undefined;
  mood?: AvatarMood;
  size?: number;
}

/** Decorative: the player's name always sits beside it. */
export function Avatar({ avatar, mood = 'grin', size = 44 }: AvatarProps) {
  const src = FILES[`../art/avatars/${avatar}-${mood}.svg`];
  if (!src) return <Art name="goblinGrin" size={size} />;
  return (
    <img
      className="avatar"
      src={src}
      alt=""
      width={size}
      height={size}
      draggable={false}
      data-avatar={avatar}
      data-mood={mood}
    />
  );
}

interface PlayerAvatarProps {
  state: GameState;
  player: Player;
  size?: number;
}

/** A player's portrait, showing the mood the game calls for right now. */
export function PlayerAvatar({ state, player, size }: PlayerAvatarProps) {
  return (
    <Avatar
      avatar={player.avatar}
      mood={avatarMood(state, player.id)}
      {...(size === undefined ? {} : { size })}
    />
  );
}
