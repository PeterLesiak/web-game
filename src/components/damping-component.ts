import * as ex from 'excalibur';

export interface DampingComponentProps {
  damping: number;
  minSpeed: number;
}

export class DampingComponent extends ex.Component implements DampingComponentProps {
  override dependencies = [ex.MotionComponent];

  damping: number = 0;
  minSpeed: number = 0;

  constructor(props?: Partial<DampingComponentProps>) {
    super();

    if (props?.damping !== undefined) {
      this.damping = props.damping;
    }

    if (props?.minSpeed !== undefined) {
      this.minSpeed = props.minSpeed;
    }
  }

  override onAdd(owner: ex.Entity): void {
    owner.on('postupdate', event => this.onPostUpdate(event.elapsed));
  }

  onPostUpdate(deltaTime: number): void {
    const motion = this.owner?.get(ex.MotionComponent);

    if (!motion) return;

    const factor = 1 - this.damping * (deltaTime / 1000);

    if (factor > 0) {
      motion.vel = motion.vel.scale(factor);
      motion.angularVelocity = motion.angularVelocity * factor;
    }

    if (factor <= 0 || motion.vel.magnitude < this.minSpeed) {
      motion.vel = ex.Vector.Zero;
      motion.angularVelocity = 0;
    }
  }
}
