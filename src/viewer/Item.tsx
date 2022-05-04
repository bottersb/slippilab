import { createMemo, For, Match, Switch } from "solid-js";
import { ItemUpdate } from "../common/types";

// TODO: characters projectiles, fly guys

// Note: Most items coordinates and sizes are divided by 256 to convert them from
// hitboxspace to worldspace.
export function Item(props: { item: ItemUpdate }) {
  return (
    <Switch>
      <Match when={props.item.typeId === 79}>
        <Needle item={props.item} />
      </Match>
      <Match when={props.item.typeId === 54}>
        <FoxLaser item={props.item} />
      </Match>
      <Match when={props.item.typeId === 55}>
        <FalcoLaser item={props.item} />
      </Match>
    </Switch>
  );
}

function Needle(props: { item: ItemUpdate }) {
  return (
    <>
      <circle
        cx={props.item.xPosition}
        cy={props.item.yPosition}
        r={500 / 256}
        fill="darkgray"
      />
    </>
  );
}

function FoxLaser(props: { item: ItemUpdate }) {
  // There is a 4th hitbox for the first frame only at -3600 (hitboxspace) with
  // size 400 / 256 that I am skipping.
  const hitboxOffsets = [-200 / 256, -933 / 256, -1666 / 256];
  const hitboxSize = 300 / 256;
  // Throws and deflected lasers are not straight horizontal
  const rotations = createMemo(() => {
    const direction = Math.atan2(props.item.yVelocity, props.item.xVelocity);
    return [Math.cos(direction), Math.sin(direction)];
  });
  return (
    <>
      <line
        x1={
          props.item.xPosition +
          hitboxOffsets[0] * props.item.facingDirection * rotations()[0]
        }
        y1={
          props.item.yPosition +
          hitboxOffsets[0] * props.item.facingDirection * rotations()[1]
        }
        x2={
          props.item.xPosition +
          hitboxOffsets.at(-1)! * props.item.facingDirection * rotations()[0]
        }
        y2={
          props.item.yPosition +
          hitboxOffsets.at(-1)! * props.item.facingDirection * rotations()[1]
        }
        stroke="red"
      ></line>
      <For each={hitboxOffsets}>
        {(hitboxOffset) => (
          <circle
            cx={
              props.item.xPosition +
              hitboxOffset * props.item.facingDirection * rotations()[0]
            }
            cy={
              props.item.yPosition +
              hitboxOffset * props.item.facingDirection * rotations()[1]
            }
            r={hitboxSize}
            fill="red"
          />
        )}
      </For>
    </>
  );
}

function FalcoLaser(props: { item: ItemUpdate }) {
  const hitboxOffsets = [-200 / 256, -933 / 256, -1666 / 256, -2400 / 256];
  const hitboxSize = 300 / 256;
  // Throws and deflected lasers are not straight horizontal
  const rotations = createMemo(() => {
    const direction = Math.atan2(props.item.yVelocity, props.item.xVelocity);
    return [Math.cos(direction), Math.sin(direction)];
  });
  return (
    <>
      <line
        x1={
          props.item.xPosition +
          hitboxOffsets[0] * props.item.facingDirection * rotations()[0]
        }
        y1={
          props.item.yPosition +
          hitboxOffsets[0] * props.item.facingDirection * rotations()[1]
        }
        x2={
          props.item.xPosition +
          hitboxOffsets.at(-1)! * props.item.facingDirection * rotations()[0]
        }
        y2={
          props.item.yPosition +
          hitboxOffsets.at(-1)! * props.item.facingDirection * rotations()[1]
        }
        stroke="red"
      ></line>
      <For each={hitboxOffsets}>
        {(hitboxOffset) => (
          <circle
            cx={
              props.item.xPosition +
              hitboxOffset * props.item.facingDirection * rotations()[0]
            }
            cy={
              props.item.yPosition +
              hitboxOffset * props.item.facingDirection * rotations()[1]
            }
            r={hitboxSize}
            fill="red"
          />
        )}
      </For>
    </>
  );
}
