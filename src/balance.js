// POC tuning defaults for a 420×420 logical-pixel room. These are hypotheses,
// not market benchmarks; adjust only after watching real mobile playtests.
// Distances scale with the room; times stay in seconds.
export const BALANCE = Object.freeze({
  daySeconds: 60,
  nightSeconds: 180,
  player: Object.freeze({
    speed: 155, // px/s: crosses the usable room (~300 px) in ~2 seconds.
    maxHealth: 5,
    damageImmunity: 1.0, // prevents multiple enemies from deleting health in one contact.
    dodgeSpeed: 300,
    dodgeDuration: 0.22,
    dodgeInvulnerability: 0.28,
    dodgeCooldown: 1.4,
  }),
  combat: Object.freeze({
    attackRange: 88,
    attackCooldown: 0.55,
    attackDamage: 1,
    spawnInterval: 2.5,
    maxEnemies: 5,
    spawnSafeRadius: 110, // do not spawn an enemy immediately beside the player.
    contactRadius: 23,
    lootPickupRadius: 32,
  }),
  enemies: Object.freeze({
    normal: Object.freeze({ health: 2, speed: 48, contactDamage: 1, reward: 1 }),
    fast: Object.freeze({ health: 2, speed: 74, contactDamage: 1, reward: 1 }),
  }),
  economy: Object.freeze({
    startingStockPerType: 3,
    emergencyStockPerType: 1, // only applied if below this floor at dawn.
    upgradeCost: 30,
    saleBase: 10,
  }),
});

// Fairness contract: telegraph approaching threats; never spawn within the safe
// radius; enemies can hit only once per immunity window. If health reaches zero,
// end the expedition and keep the minimum stock floor rather than soft-locking.
// A normal enemy takes two attacks (~0.55 s after the first hit). At 48 px/s it
// needs ~1.35 s to travel from attack range to contact, leaving reaction time.
// Fast enemies take ~0.88 s over that distance. Test these values on real phones.
