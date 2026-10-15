import { Bus, Camera, Coffee, IceCreamCone, Landmark, MapPin, Plane, TrainFront, Utensils } from "lucide-react";

// What orbits around the loader's wizard while the AI plans the trip
const ORBIT_ICONS = [Plane, Utensils, TrainFront, Camera, IceCreamCone, Bus, Landmark, Coffee, MapPin];
const ORBIT_RADIUS = 104; // px, from the centre of the 16rem stage

// A dashed orbit with travel icons on it; the ring turns and each icon stays upright (animations in globals.css)
const OrbitingIcons = () => (
  <>
    <div aria-hidden className="absolute inset-[22px] rounded-full border-2 border-dashed border-muted-foreground/20" />
    <div aria-hidden className="loader-orbit absolute inset-0">
      {ORBIT_ICONS.map((Icon, position) => {
        const angle = (360 / ORBIT_ICONS.length) * position;
        return (
          <span
            key={position}
            className="absolute top-1/2 left-1/2 -mt-5 -ml-5"
            style={{ transform: `rotate(${angle}deg) translateY(-${ORBIT_RADIUS}px) rotate(-${angle}deg)` }}
          >
            <span className="loader-upright grid size-10 place-items-center rounded-full bg-background text-primary-ink shadow-sm ring-1 ring-foreground/10">
              <Icon className="size-5" />
            </span>
          </span>
        );
      })}
    </div>
  </>
);

export default OrbitingIcons;
