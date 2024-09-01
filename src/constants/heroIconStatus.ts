enum HeroIconStatus {
  RUNNING = "heroRunning",
  HOME = "heroHome",
  DEAD = "heroDead",
  REVIVING = "heroReviving",
  REINFORCING = "heroReinforcing",
}

export const HeroIconStatusKeys = Object.keys(
  HeroIconStatus
) as (keyof typeof HeroIconStatus)[];

export default HeroIconStatus;
