import React from "react";

type Props = {
  label: string;
  volume: number;
  maxVolume: number;
  setVolume: (volume: number) => void;
  muted?: boolean;
  setMuted?: (muted: boolean) => void;
};

const AudioController: React.FC<Props> = React.memo(
  ({ label, volume, maxVolume, setVolume, muted, setMuted }) => {
    return (
      <div>
        <p>{label}</p>
        <input
          type="range"
          min={0}
          max={maxVolume}
          step={1}
          defaultValue={volume}
          onChange={(value) => {
            const nextVolume = Number(value.target.value);
            if (!Number.isNaN(nextVolume)) {
              setVolume(nextVolume);
            }
          }}
        />
        {muted !== undefined && setMuted !== undefined && (
          <button
            onClick={() => {
              setMuted(!muted);
            }}
          >{`mute ${muted ? "ON" : "OFF"}`}</button>
        )}
      </div>
    );
  }
);

export default AudioController;
