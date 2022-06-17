import { Character } from "~/viewer/characters/character";
import { ActionName } from "~/common/ids";

export const ness: Character = {
  scale: 1,
  shieldOffset: [2.724, 9.003], // model units // TODO
  shieldSize: 1 * 13.75, // world units
  animationMap: new Map<ActionName, string>([
    ["AppealL", "AppealL"],
    ["AppealR", "AppealR"],
    ["AttackS3Hi", "AttackS3Hi"],
    ["AttackS3HiS", "AttackS3HiS"],
    ["AttackS3Lw", "AttackS3Lw"],
    ["AttackS3LwS", "AttackS3LwS"],
    ["AttackS3S", "AttackS3S"],
    ["AttackS4Hi", "AttackS4Hi"],
    ["AttackS4HiS", "AttackS4Hi"],
    ["AttackS4Lw", "AttackS4Lw"],
    ["AttackS4LwS", "AttackS4Lw"],
    ["AttackS4S", "AttackS4"],
    ["BarrelWait", ""],
    ["Bury", ""],
    ["BuryJump", ""],
    ["BuryWait", ""],
    ["CaptureCaptain", ""],
    ["CaptureDamageKoopa", ""],
    ["CaptureDamageKoopaAir", ""],
    ["CaptureKirby", ""],
    ["CaptureKirbyYoshi", ""],
    ["CaptureKoopa", ""],
    ["CaptureKoopaAir", ""],
    ["CaptureMewtwo", ""],
    ["CaptureMewtwoAir", ""],
    ["CaptureWaitKirby", ""],
    ["CaptureWaitKoopa", ""],
    ["CaptureWaitKoopaAir", ""],
    ["CaptureYoshi", ""],
    ["CatchDashPull", "CatchWait"],
    ["CatchPull", "CatchWait"],
    ["DamageBind", ""],
    ["DamageIce", ""],
    ["DamageIceJump", "Fall"],
    ["DamageSong", ""],
    ["DamageSongRv", ""],
    ["DamageSongWait", ""],
    ["DeadDown", ""],
    ["DeadLeft", ""],
    ["DeadRight", ""],
    ["DeadUpFallHitCamera", ""],
    ["DeadUpFallHitCameraIce", ""],
    ["DeadUpFallIce", ""],
    ["DeadUpStar", ""],
    ["DeadUpStarIce", ""],
    ["DownReflect", ""],
    ["EntryEnd", "Entry"],
    ["EntryStart", "Entry"],
    ["Escape", "EscapeN"],
    ["FlyReflectCeil", ""],
    ["FlyReflectWall", "WallDamage"],
    ["Guard", "Guard"],
    ["GuardOff", "GuardOff"],
    ["GuardOn", "GuardOn"],
    ["GuardReflect", "Guard"],
    ["GuardSetOff", "GuardDamage"],
    ["ItemParasolDamageFall", ""],
    ["ItemParasolFall", ""],
    ["ItemParasolFallSpecial", ""],
    ["ItemParasolOpen", ""],
    ["KirbyYoshiEgg", ""],
    ["KneeBend", "Landing"],
    ["LandingFallSpecial", "Landing"],
    ["LiftTurn", ""],
    ["LiftWait", ""],
    ["LiftWalk1", ""],
    ["LiftWalk2", ""],
    ["LightThrowAirB4", "LightThrowAirB"],
    ["LightThrowAirF4", "LightThrowAirF"],
    ["LightThrowAirHi4", "LightThrowAirHi"],
    ["LightThrowAirLw4", "LightThrowAirLw"],
    ["LightThrowB4", "LightThrowB"],
    ["LightThrowF4", "LightThrowF"],
    ["LightThrowHi4", "LightThrowHi"],
    ["LightThrowLw4", "LightThrowLw"],
    ["Rebirth", "Entry"],
    ["RebirthWait", "Wait"],
    ["ReboundStop", "Rebound"],
    ["RunDirect", ""],
    ["ShieldBreakDownD", "DownBoundD"],
    ["ShieldBreakDownU", "DownBoundU"],
    ["ShieldBreakFall", "DamageFall"],
    ["ShieldBreakFly", ""],
    ["ShieldBreakStandD", "DownStandD"],
    ["ShieldBreakStandU", "DownStandU"],
    ["ShoulderedTurn", ""],
    ["ShoulderedWait", ""],
    ["ShoulderedWalkFast", ""],
    ["ShoulderedWalkMiddle", ""],
    ["ShoulderedWalkSlow", ""],
    ["SwordSwing1", "Swing1"],
    ["SwordSwing3", "Swing3"],
    ["SwordSwing4", "Swing4"],
    ["SwordSwingDash", "SwingDash"],
    ["ThrownB", ""],
    ["ThrownCopyStar", ""],
    ["ThrownF", ""],
    ["ThrownFB", ""],
    ["ThrownFF", ""],
    ["ThrownFHi", ""],
    ["ThrownFLw", ""],
    ["ThrownHi", ""],
    ["ThrownKirby", ""],
    ["ThrownKirbyStar", ""],
    ["ThrownKoopaAirB", ""],
    ["ThrownKoopaAirF", ""],
    ["ThrownKoopaB", ""],
    ["ThrownKoopaF", ""],
    ["ThrownLw", ""],
    ["ThrownLwWomen", ""],
    ["ThrownMewtwo", ""],
    ["ThrownMewtwoAir", ""],
    ["Wait", "Wait"],
    ["YoshiEgg", ""],
  ]),
  specialsMap: new Map<number, string>([
    [341, "AttackS4"],
    [342, "AttackHi4"],
    [343, "AttackHi4"],
    [344, "AttackHi4"],
    [345, "AttackLw4"],
    [346, "AttackLw4"],
    [347, "AttackLw4"],
    [348, "SpecialNStart"],
    [349, "SpecialNHold"],
    [350, "SpecialNEnd"],
    [351, "SpecialNEnd"],
    [352, "SpecialAirNStart"],
    [353, "SpecialAirNHold"],
    [354, "SpecialAirNEnd"],
    [355, "SpecialAirNEnd"],
    [356, "SpecialS"],
    [357, "SpecialAirS"],
    [358, "SpecialHiStart"],
    [359, "SpecialHiHold"],
    [360, "SpecialHiEnd"],
    [361, "SpecialHi"],
    [362, "SpecialAirHiStart"],
    [363, "SpecialAirHiHold"],
    [364, "SpecialAirHiEnd"],
    [365, "SpecialHi"],
    [366, "SpecialHi"],
    [367, "SpecialLwStart"],
    [368, "SpecialLwHold"],
    [369, "SpecialLwHit"],
    [370, "SpecialLwEnd"],
    [371, ""],
    [372, "SpecialAirLwStart"],
    [373, "SpecialAirLwHold"],
    [374, "SpecialAirLwHit"],
    [375, "SpecialAirLwEnd"],
    [376, ""],
  ]),
};
