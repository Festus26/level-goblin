import { describe, expect, it } from 'vitest';
import {
  AVATARS,
  LIMITS,
  applyAction,
  avatarMood,
  isAvatar,
  canEditPlayer,
  combatResult,
  createGame,
  findPlayer,
  generateSessionCode,
  normalizeSessionCode,
  parseAction,
  secureDieRoll,
  upgradeGame,
  strength,
  type Action,
  type ActionContext,
  type EditRights,
  type GameState,
} from '../src/index.ts';

const ctx = (actorId: string | null, roll = 4): ActionContext => ({
  actorId,
  now: 1000,
  rollDie: () => roll,
});

function run(state: GameState, action: Action, actorId: string | null = null): GameState {
  const result = applyAction(state, action, ctx(actorId));
  if (!result.ok) throw new Error(`Rejected: ${result.error}`);
  return result.state;
}

const errorOf = (state: GameState, action: Action, actorId: string | null) => {
  const result = applyAction(state, action, ctx(actorId));
  return result.ok ? null : result.error;
};

/** A table of Ada (host), Bo and Cy. */
function table(editRights: EditRights = 'ownAndHost', winLevel = 10): GameState {
  let state = createGame({ hostId: 'ada', editRights, winLevel });
  state = run(state, { type: 'addPlayer', id: 'ada', name: 'Ada', color: 'gold' });
  state = run(state, { type: 'addPlayer', id: 'bo', name: 'Bo', color: 'red' });
  return run(state, { type: 'addPlayer', id: 'cy', name: 'Cy', color: 'blue' });
}

const levelOf = (state: GameState, id: string) => findPlayer(state, id)?.level;
const lastLog = (state: GameState) => state.log.at(-1);

describe('players', () => {
  it('starts players at level 1 with no gear, and gives the first player the turn', () => {
    const state = table();
    expect(state.players).toHaveLength(3);
    expect(findPlayer(state, 'bo')).toMatchObject({ level: 1, gear: 0 });
    expect(state.turnPlayerId).toBe('ada');
  });

  it('only lets the server or table device add seats', () => {
    expect(
      errorOf(table(), { type: 'addPlayer', id: 'x', name: 'X', color: 'pink' }, 'ada'),
    ).toBe('forbidden');
  });

  it('rejects a full table and duplicate ids', () => {
    let state = createGame();
    for (let i = 0; i < LIMITS.maxPlayers; i++) {
      state = run(state, { type: 'addPlayer', id: `p${i}`, name: 'P', color: 'gold' });
    }
    expect(
      errorOf(state, { type: 'addPlayer', id: 'new', name: 'N', color: 'gold' }, null),
    ).toBe('tableFull');
    expect(
      errorOf(table(), { type: 'addPlayer', id: 'bo', name: 'N', color: 'gold' }, null),
    ).toBe('duplicatePlayer');
  });

  it('counts strength as level plus gear', () => {
    const state = run(table(), { type: 'changeGear', playerId: 'ada', delta: 5 });
    expect(strength(findPlayer(state, 'ada')!)).toBe(6);
  });

  it('keeps levels and gear inside their limits', () => {
    let state = run(table(), { type: 'changeLevel', playerId: 'bo', delta: -5 });
    expect(levelOf(state, 'bo')).toBe(1);
    state = run(state, { type: 'changeGear', playerId: 'bo', delta: -7 });
    expect(findPlayer(state, 'bo')?.gear).toBe(-7);
  });

  it('ignores a level change that has no effect', () => {
    const before = table();
    const after = run(before, { type: 'changeLevel', playerId: 'bo', delta: -1 });
    expect(after).toBe(before);
  });

  it('stops anyone but the host removing a player, and keeps the host seated', () => {
    const state = table();
    const remove = { type: 'removePlayer', playerId: 'cy' } as const;
    expect(errorOf(state, remove, 'bo')).toBe('forbidden');
    expect(errorOf(state, { type: 'removePlayer', playerId: 'ada' }, 'ada')).toBe(
      'hostCannotLeave',
    );
    expect(run(state, remove, 'ada').players).toHaveLength(2);
  });

  it('moves the turn on and ends the fight when the fighter is removed', () => {
    let state = run(table(), { type: 'setTurn', playerId: 'bo' });
    state = run(state, { type: 'startCombat', fighterId: 'bo', monsterLevel: 5 });
    state = run(state, { type: 'removePlayer', playerId: 'bo' });
    expect(state.turnPlayerId).toBe('cy');
    expect(state.combat).toBeNull();
  });

  it('removes a helper from the fight when they leave', () => {
    let state = run(table(), { type: 'startCombat', fighterId: 'ada', monsterLevel: 5 });
    state = run(state, { type: 'updateCombat', helperId: 'cy' });
    state = run(state, { type: 'removePlayer', playerId: 'cy' });
    expect(state.combat?.helperId).toBeNull();
  });
});

describe('leaving and coming back', () => {
  const leave = (state: GameState, playerId: string) =>
    run(state, { type: 'removePlayer', playerId });
  const back = (playerId: string) => ({ type: 'returnPlayer', playerId }) as const;

  it('keeps the stats of a player who leaves', () => {
    let state = run(table(), { type: 'changeLevel', playerId: 'bo', delta: 3 });
    state = run(state, { type: 'changeGear', playerId: 'bo', delta: 2 });
    state = leave(state, 'bo');
    expect(findPlayer(state, 'bo')).toBeUndefined();
    expect(state.departed).toMatchObject([{ id: 'bo', level: 4, gear: 2 }]);
  });

  it('brings them back with those stats, and off the departed list', () => {
    let state = run(table(), { type: 'changeLevel', playerId: 'bo', delta: 3 });
    state = run(leave(state, 'bo'), back('bo'));
    expect(findPlayer(state, 'bo')).toMatchObject({ level: 4, color: 'red' });
    expect(state.departed).toEqual([]);
    expect(lastLog(state)).toMatchObject({ type: 'join', playerName: 'Bo' });
  });

  it('picks a new color if theirs was taken while they were away', () => {
    let state = leave(table(), 'bo');
    state = run(state, { type: 'addPlayer', id: 'di', name: 'Di', color: 'red' });
    state = run(state, back('bo'));
    const colors = state.players.map((player) => player.color);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('only lets the server or table device bring someone back', () => {
    expect(errorOf(leave(table(), 'bo'), back('bo'), 'ada')).toBe('forbidden');
  });

  it('rejects a player who never left, and a full table', () => {
    expect(errorOf(table(), back('bo'), null)).toBe('playerNotFound');
    let state = leave(table(), 'bo');
    for (let i = state.players.length; i < LIMITS.maxPlayers; i++) {
      state = run(state, { type: 'addPlayer', id: `p${i}`, name: 'P', color: 'gold' });
    }
    expect(errorOf(state, back('bo'), null)).toBe('tableFull');
  });

  it('restores a win when the winner returns', () => {
    let state = run(table('ownAndHost', 5), { type: 'changeLevel', playerId: 'bo', delta: 4 });
    state = leave(state, 'bo');
    expect(state.winnerId).toBeNull();
    state = run(state, back('bo'));
    expect(state.winnerId).toBe('bo');
  });

  it('gives a returning player the turn if nobody has it', () => {
    let state = run(createGame(), { type: 'addPlayer', id: 'ada', name: 'Ada', color: 'gold' });
    state = leave(state, 'ada');
    expect(state.turnPlayerId).toBeNull();
    expect(run(state, back('ada')).turnPlayerId).toBe('ada');
  });

  it('can undo older changes again after returning', () => {
    let state = run(table(), { type: 'changeLevel', playerId: 'bo', delta: 2 });
    const logId = lastLog(state)!.id;
    state = run(leave(state, 'bo'), back('bo'));
    expect(levelOf(run(state, { type: 'undo', logId }), 'bo')).toBe(1);
  });

  it('caps how many departed players are remembered', () => {
    let state = createGame();
    for (let i = 0; i < LIMITS.maxDeparted + 5; i++) {
      state = run(state, { type: 'addPlayer', id: `p${i}`, name: 'P', color: 'gold' });
      state = leave(state, `p${i}`);
    }
    expect(state.departed).toHaveLength(LIMITS.maxDeparted);
  });

  it('upgrades a game saved before leaving existed', () => {
    const { departed: _departed, ...oldSave } = table();
    const upgraded = upgradeGame(oldSave as GameState);
    expect(leave(upgraded, 'bo').departed).toHaveLength(1);
  });
});

describe('edit rights', () => {
  const change = (playerId: string) =>
    ({ type: 'changeLevel', playerId, delta: 1 }) as const;

  it('own: nobody edits anyone else, including the host', () => {
    const state = table('own');
    expect(errorOf(state, change('bo'), 'bo')).toBeNull();
    expect(errorOf(state, change('bo'), 'ada')).toBe('forbidden');
    expect(errorOf(state, change('ada'), 'bo')).toBe('forbidden');
  });

  it('ownAndHost: the host can edit anyone, others only themselves', () => {
    const state = table('ownAndHost');
    expect(errorOf(state, change('bo'), 'ada')).toBeNull();
    expect(errorOf(state, change('bo'), 'bo')).toBeNull();
    expect(errorOf(state, change('cy'), 'bo')).toBe('forbidden');
  });

  it('everyone: any seated player can edit any player', () => {
    const state = table('everyone');
    expect(errorOf(state, change('cy'), 'bo')).toBeNull();
  });

  it('gives the shared table device every right', () => {
    expect(canEditPlayer(table('own'), null, 'bo')).toBe(true);
  });

  it('rejects actions from someone who is not seated', () => {
    expect(errorOf(table('everyone'), change('bo'), 'stranger')).toBe('forbidden');
    expect(errorOf(table(), { type: 'rollDie' }, 'stranger')).toBe('forbidden');
  });

  it('lets only the host change settings, and applies new rights straight away', () => {
    const state = table('own');
    const open = { type: 'setEditRights', editRights: 'everyone' } as const;
    expect(errorOf(state, open, 'bo')).toBe('forbidden');
    const next = run(state, open, 'ada');
    expect(errorOf(next, change('cy'), 'bo')).toBeNull();
  });

  it('hands host rights over only from the current host', () => {
    const state = table();
    const give = { type: 'transferHost', playerId: 'bo' } as const;
    expect(errorOf(state, give, 'cy')).toBe('forbidden');
    expect(run(state, give, 'ada').hostId).toBe('bo');
  });
});

describe('undo', () => {
  it('reverts a level change and marks the entry', () => {
    let state = run(table(), { type: 'changeLevel', playerId: 'bo', delta: 3 });
    const logId = lastLog(state)!.id;
    state = run(state, { type: 'undo', logId });
    expect(levelOf(state, 'bo')).toBe(1);
    expect(state.log.find((entry) => entry.id === logId)?.undone).toBe(true);
    expect(lastLog(state)).toMatchObject({ type: 'undo', stat: 'level', value: -3 });
  });

  it('keeps later changes when undoing an older one', () => {
    let state = run(table(), { type: 'changeGear', playerId: 'bo', delta: 3 });
    const logId = lastLog(state)!.id;
    state = run(state, { type: 'changeGear', playerId: 'bo', delta: 2 });
    state = run(state, { type: 'undo', logId });
    expect(findPlayer(state, 'bo')?.gear).toBe(2);
  });

  it('records only what really changed, so a clamped change undoes correctly', () => {
    let state = run(table(), { type: 'changeLevel', playerId: 'bo', delta: 2 });
    state = run(state, { type: 'changeLevel', playerId: 'bo', delta: -5 });
    expect(levelOf(state, 'bo')).toBe(1);
    state = run(state, { type: 'undo', logId: lastLog(state)!.id });
    expect(levelOf(state, 'bo')).toBe(3);
  });

  it('cannot undo twice, and cannot undo things that are not stat changes', () => {
    let state = run(table(), { type: 'changeLevel', playerId: 'bo', delta: 1 });
    const logId = lastLog(state)!.id;
    state = run(state, { type: 'undo', logId });
    expect(errorOf(state, { type: 'undo', logId }, null)).toBe('cannotUndo');
    expect(errorOf(state, { type: 'undo', logId: 1 }, null)).toBe('cannotUndo');
    expect(errorOf(state, { type: 'undo', logId: 9999 }, null)).toBe('cannotUndo');
  });

  it('follows edit rights', () => {
    const state = run(table('ownAndHost'), { type: 'changeLevel', playerId: 'bo', delta: 1 });
    const logId = lastLog(state)!.id;
    expect(errorOf(state, { type: 'undo', logId }, 'cy')).toBe('forbidden');
    expect(errorOf(state, { type: 'undo', logId }, 'ada')).toBeNull();
  });

  it('fails safely once the player has left', () => {
    let state = run(table(), { type: 'changeLevel', playerId: 'bo', delta: 1 });
    const logId = lastLog(state)!.id;
    state = run(state, { type: 'removePlayer', playerId: 'bo' });
    expect(errorOf(state, { type: 'undo', logId }, null)).toBe('cannotUndo');
  });
});

describe('combat', () => {
  const fight = (monsterLevel: number) =>
    run(
      run(table(), { type: 'changeGear', playerId: 'ada', delta: 4 }),
      { type: 'startCombat', fighterId: 'ada', monsterLevel },
    );

  it('adds level, gear, helper and one-shot bonuses for the players', () => {
    let state = run(fight(8), { type: 'changeLevel', playerId: 'bo', delta: 1 });
    state = run(state, { type: 'updateCombat', helperId: 'bo', playerBonus: 3 });
    expect(combatResult(state)).toEqual({
      playerTotal: 10,
      monsterTotal: 8,
      playersWin: true,
    });
  });

  it('adds monster bonuses, including negative ones', () => {
    const state = run(fight(8), { type: 'updateCombat', monsterBonus: -4 });
    expect(combatResult(state)?.monsterTotal).toBe(4);
  });

  it('gives ties to the monster', () => {
    expect(combatResult(fight(5))).toMatchObject({ playerTotal: 5, playersWin: false });
  });

  it('reflects live stat changes during the fight', () => {
    const state = run(fight(5), { type: 'changeGear', playerId: 'ada', delta: 1 });
    expect(combatResult(state)?.playersWin).toBe(true);
  });

  it('allows one fight at a time, and no fighter helping themselves', () => {
    const state = fight(5);
    expect(
      errorOf(state, { type: 'startCombat', fighterId: 'bo', monsterLevel: 1 }, null),
    ).toBe('combatInProgress');
    expect(errorOf(state, { type: 'updateCombat', helperId: 'ada' }, null)).toBe(
      'invalidAction',
    );
  });

  it('lets any seated player meddle, whatever the edit rights', () => {
    let state = createGame({ hostId: 'ada', editRights: 'own' });
    state = run(state, { type: 'addPlayer', id: 'ada', name: 'Ada', color: 'gold' });
    state = run(state, { type: 'addPlayer', id: 'bo', name: 'Bo', color: 'red' });
    state = run(state, { type: 'startCombat', fighterId: 'ada', monsterLevel: 2 });
    expect(errorOf(state, { type: 'updateCombat', monsterBonus: 5 }, 'bo')).toBeNull();
  });

  it('reports no result outside a fight, and rejects ending one', () => {
    expect(combatResult(table())).toBeNull();
    expect(errorOf(table(), { type: 'endCombat' }, null)).toBe('noCombat');
    expect(run(fight(5), { type: 'endCombat' }).combat).toBeNull();
  });
});

describe('win alert', () => {
  const climb = (state: GameState, playerId: string, delta: number) =>
    run(state, { type: 'changeLevel', playerId, delta });

  it('names the player who reaches the winning level', () => {
    const state = climb(table('ownAndHost', 5), 'bo', 4);
    expect(state.winnerId).toBe('bo');
    expect(state.log.some((entry) => entry.type === 'win')).toBe(true);
  });

  it('logs the level change before the win it caused', () => {
    const state = climb(table('ownAndHost', 5), 'bo', 4);
    expect(state.log.slice(-2).map((entry) => entry.type)).toEqual(['level', 'win']);
  });

  it('clears the winner when their level drops back', () => {
    let state = climb(table('ownAndHost', 5), 'bo', 4);
    state = climb(state, 'bo', -1);
    expect(state.winnerId).toBeNull();
  });

  it('clears the winner when the win is undone', () => {
    let state = climb(table('ownAndHost', 5), 'bo', 4);
    const entry = state.log.findLast((item) => item.type === 'level')!;
    state = run(state, { type: 'undo', logId: entry.id });
    expect(state.winnerId).toBeNull();
  });

  it('keeps the first winner if someone else reaches the level later', () => {
    let state = climb(table('ownAndHost', 5), 'bo', 4);
    state = climb(state, 'cy', 4);
    expect(state.winnerId).toBe('bo');
  });

  it('passes the win on if the winner drops back and another player qualifies', () => {
    let state = climb(climb(table('ownAndHost', 5), 'bo', 4), 'cy', 4);
    state = climb(state, 'bo', -1);
    expect(state.winnerId).toBe('cy');
  });

  it('rechecks when the winning level changes', () => {
    let state = climb(table('ownAndHost', 10), 'bo', 4);
    state = run(state, { type: 'setWinLevel', winLevel: 5 });
    expect(state.winnerId).toBe('bo');
    state = run(state, { type: 'setWinLevel', winLevel: 20 });
    expect(state.winnerId).toBeNull();
  });

  it('passes the win on when the winner is removed', () => {
    let state = climb(climb(table('ownAndHost', 5), 'bo', 4), 'cy', 4);
    state = run(state, { type: 'removePlayer', playerId: 'bo' });
    expect(state.winnerId).toBe('cy');
  });
});

describe('turns and dice', () => {
  it('moves through the table and wraps around', () => {
    let state = table();
    state = run(state, { type: 'nextTurn' });
    expect(state.turnPlayerId).toBe('bo');
    state = run(run(state, { type: 'nextTurn' }), { type: 'nextTurn' });
    expect(state.turnPlayerId).toBe('ada');
  });

  it('lets the current player, the host, or anyone in everyone mode move the turn', () => {
    const state = run(table(), { type: 'setTurn', playerId: 'bo' });
    expect(errorOf(state, { type: 'nextTurn' }, 'cy')).toBe('forbidden');
    expect(errorOf(state, { type: 'nextTurn' }, 'bo')).toBeNull();
    expect(errorOf(state, { type: 'nextTurn' }, 'ada')).toBeNull();
    expect(errorOf(table('everyone'), { type: 'nextTurn' }, 'cy')).toBeNull();
  });

  it('takes the roll from the context, never from the action', () => {
    const forged = { type: 'rollDie', value: 6 } as Action;
    const result = applyAction(table(), forged, ctx('bo', 2));
    expect(result.ok && result.state.lastRoll).toMatchObject({ value: 2, playerId: 'bo' });
  });
});

describe('versions and the log', () => {
  it('raises the version once per accepted action', () => {
    const before = table();
    const after = run(before, { type: 'rollDie' });
    expect(after.version).toBe(before.version + 1);
  });

  it('does not change the state it was given', () => {
    const state = table();
    const snapshot = JSON.parse(JSON.stringify(state));
    run(state, { type: 'changeLevel', playerId: 'bo', delta: 2 });
    expect(state).toEqual(snapshot);
  });

  it('caps the log but keeps ids unique', () => {
    let state = table();
    for (let i = 0; i < LIMITS.maxLogEntries + 20; i++) {
      state = run(state, { type: 'rollDie' });
    }
    expect(state.log).toHaveLength(LIMITS.maxLogEntries);
    expect(new Set(state.log.map((entry) => entry.id)).size).toBe(LIMITS.maxLogEntries);
  });

  it('keeps names in the log after a player leaves', () => {
    let state = run(table(), { type: 'changeLevel', playerId: 'bo', delta: 1 });
    state = run(state, { type: 'removePlayer', playerId: 'bo' });
    expect(state.log.find((entry) => entry.type === 'level')?.playerName).toBe('Bo');
  });
});

describe('parseAction', () => {
  it('accepts valid actions and strips unknown fields', () => {
    expect(
      parseAction({ type: 'changeLevel', playerId: 'bo', delta: 1, hack: true }),
    ).toEqual({ type: 'changeLevel', playerId: 'bo', delta: 1 });
    expect(parseAction({ type: 'rollDie', value: 6 })).toEqual({ type: 'rollDie' });
  });

  it('cleans names', () => {
    expect(
      parseAction({ type: 'addPlayer', id: 'a', name: '  Big   Ada ', color: 'gold' }),
    ).toMatchObject({ name: 'Big Ada' });
  });

  it.each([
    ['null', null],
    ['an array', []],
    ['an unknown type', { type: 'giveMeTheWin' }],
    ['a fractional delta', { type: 'changeLevel', playerId: 'a', delta: 1.5 }],
    ['a zero delta', { type: 'changeGear', playerId: 'a', delta: 0 }],
    ['a huge delta', { type: 'changeLevel', playerId: 'a', delta: 500 }],
    ['a text delta', { type: 'changeLevel', playerId: 'a', delta: '1' }],
    ['a blank name', { type: 'addPlayer', id: 'a', name: '   ', color: 'gold' }],
    ['a long name', { type: 'addPlayer', id: 'a', name: 'x'.repeat(25), color: 'gold' }],
    ['an unknown color', { type: 'addPlayer', id: 'a', name: 'A', color: 'plaid' }],
    ['unknown rights', { type: 'setEditRights', editRights: 'chaos' }],
    ['a win level below the minimum', { type: 'setWinLevel', winLevel: 1 }],
    ['an oversized combat value', { type: 'updateCombat', playerBonus: 5000 }],
    ['a bad helper id', { type: 'updateCombat', helperId: 7 }],
  ])('rejects %s', (_label, input) => {
    expect(parseAction(input)).toBeNull();
  });

  it('allows clearing the helper', () => {
    expect(parseAction({ type: 'updateCombat', helperId: null })).toEqual({
      type: 'updateCombat',
      helperId: null,
    });
  });
});

describe('secureDieRoll', () => {
  it('only rolls whole numbers from 1 to 6, and reaches every face', () => {
    const seen = new Set(Array.from({ length: 2000 }, secureDieRoll));
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe('portraits', () => {
  it('has 100 different portraits', () => {
    expect(new Set(AVATARS).size).toBe(100);
  });

  it('keeps a chosen portrait, and lets two players share it', () => {
    let state = createGame();
    state = run(state, { type: 'addPlayer', id: 'a', name: 'A', color: 'gold', avatar: 'cat-pirate' });
    state = run(state, { type: 'addPlayer', id: 'b', name: 'B', color: 'red', avatar: 'cat-pirate' });
    expect(state.players.map((player) => player.avatar)).toEqual(['cat-pirate', 'cat-pirate']);
  });

  it('gives a valid portrait when none is chosen', () => {
    expect(isAvatar(findPlayer(table(), 'bo')?.avatar)).toBe(true);
  });

  it('changes a portrait, following edit rights', () => {
    const change = { type: 'updatePlayer', playerId: 'bo', avatar: 'elf-bard' } as const;
    expect(errorOf(table('own'), change, 'ada')).toBe('forbidden');
    expect(findPlayer(run(table('own'), change, 'bo'), 'bo')?.avatar).toBe('elf-bard');
  });

  it('keeps a portrait through leaving and coming back', () => {
    let state = run(table(), { type: 'updatePlayer', playerId: 'bo', avatar: 'elf-bard' });
    state = run(state, { type: 'removePlayer', playerId: 'bo' });
    state = run(state, { type: 'returnPlayer', playerId: 'bo' });
    expect(findPlayer(state, 'bo')?.avatar).toBe('elf-bard');
  });

  it('records the portrait in the log', () => {
    const state = run(table(), { type: 'updatePlayer', playerId: 'bo', avatar: 'elf-bard' });
    const next = run(state, { type: 'changeLevel', playerId: 'bo', delta: 1 });
    expect(lastLog(next)?.playerAvatar).toBe('elf-bard');
  });

  it('only accepts real portraits from outside', () => {
    expect(parseAction({ type: 'updatePlayer', playerId: 'a', avatar: 'dragon-king' })).toBeNull();
    expect(
      parseAction({ type: 'addPlayer', id: 'a', name: 'A', color: 'gold', avatar: 7 }),
    ).toBeNull();
    expect(parseAction({ type: 'updatePlayer', playerId: 'a', avatar: 'elf-bard' })).toMatchObject({
      avatar: 'elf-bard',
    });
  });

  it('gives old saves a stable portrait', () => {
    const state = table();
    const old = {
      ...state,
      players: state.players.map(({ avatar: _avatar, ...player }) => player),
    } as unknown as GameState;
    const once = upgradeGame(old);
    expect(isAvatar(once.players[0]?.avatar)).toBe(true);
    expect(upgradeGame(old).players[0]?.avatar).toBe(once.players[0]?.avatar);
  });

  describe('moods', () => {
    const fight = (monsterLevel: number) =>
      run(table(), { type: 'startCombat', fighterId: 'ada', monsterLevel });

    it('grins by default', () => {
      expect(avatarMood(table(), 'ada')).toBe('grin');
    });

    it('follows the fight for the fighter and helper only', () => {
      let state = fight(5);
      expect(avatarMood(state, 'ada')).toBe('lose');
      expect(avatarMood(state, 'bo')).toBe('grin');

      state = run(state, { type: 'updateCombat', helperId: 'bo', playerBonus: 9 });
      expect(avatarMood(state, 'ada')).toBe('win');
      expect(avatarMood(state, 'bo')).toBe('win');
      expect(avatarMood(state, 'cy')).toBe('grin');
    });

    it('goes back to a grin when the fight ends', () => {
      expect(avatarMood(run(fight(5), { type: 'endCombat' }), 'ada')).toBe('grin');
    });

    it('shows win for the winner and lose for everyone else', () => {
      const state = run(table('ownAndHost', 5), { type: 'changeLevel', playerId: 'bo', delta: 4 });
      expect(avatarMood(state, 'bo')).toBe('win');
      expect(avatarMood(state, 'ada')).toBe('lose');
    });

    it('lets the end of the game outrank a fight', () => {
      let state = run(table('ownAndHost', 5), { type: 'changeLevel', playerId: 'bo', delta: 4 });
      state = run(state, { type: 'startCombat', fighterId: 'bo', monsterLevel: 99 });
      expect(avatarMood(state, 'bo')).toBe('win');
    });
  });
});

describe('session codes', () => {
  it('generates valid codes with no look-alike characters', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateSessionCode();
      expect(code).toMatch(/^[A-HJKMNP-Z2-9]{5}$/);
      expect(normalizeSessionCode(code)).toBe(code);
    }
  });

  it('accepts sloppy typing, and rejects anything that cannot be a code', () => {
    expect(normalizeSessionCode(' ab-cde ')).toBe('ABCDE');
    expect(normalizeSessionCode('ABCD')).toBeNull();
    expect(normalizeSessionCode('ABCD1')).toBeNull();
    expect(normalizeSessionCode(5)).toBeNull();
  });
});
