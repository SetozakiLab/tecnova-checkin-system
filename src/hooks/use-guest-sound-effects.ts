"use client";

import useSound from "use-sound";

type UseGuestSoundEffectsOptions = {
  clickVolume?: number;
  successVolume?: number;
};

export function useGuestSoundEffects(
  options: UseGuestSoundEffectsOptions = {},
) {
  const { clickVolume = 0.6, successVolume = 0.6 } = options;

  const [playClick] = useSound("/sounds/click.mp3", {
    volume: clickVolume,
  });

  const [playSuccess] = useSound("/sounds/success.mp3", {
    volume: successVolume,
  });

  return {
    playClick,
    playSuccess,
  };
}
