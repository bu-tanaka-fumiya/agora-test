import React from "react";

type Props = {
  type: "local" | "remote";
  label: string;
  volume: number;
  maxVolume: number;
  setVolume: (volume: number) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  volumeLevel: number;
};

const VolumeController: React.FC<Props> = React.memo(
  ({
    type,
    label,
    volume,
    maxVolume,
    setVolume,
    muted,
    setMuted,
    volumeLevel,
  }) => {
    return (
      <div className="volumeController">
        <h3>{label}</h3>
        <div
          className="volumeController__items"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <p>音量調整</p>
            <input
              style={{ height: 30 }}
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
          </div>
          <div>
            <p>ミュート切り替え</p>
            <button
              style={{ width: 80, margin: "3px 0" }}
              onClick={() => {
                setMuted(!muted);
              }}
            >{`${muted ? "ON" : "OFF"}`}</button>
          </div>
          <div>
            <p>{`${type === "remote" ? "配信者側の" : ""}音量レベル`}</p>
            <div
              style={{
                height: 12,
                margin: "9px 0",
                width: 100,
                backgroundColor: "#1a1a1a",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${volumeLevel * 100}%`,
                  backgroundColor: "#1FE381",
                }}
              />
            </div>
          </div>
          {type === "remote" && (
            <div>
              <p>視聴者側の音量レベル</p>
              <div
                style={{
                  height: 12,
                  margin: "9px 0",
                  width: 100,
                  backgroundColor: "#1a1a1a",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${
                      ((Number(!muted) * volumeLevel * volume) / maxVolume) *
                      100
                    }%`,
                    backgroundColor: "#1FE381",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default VolumeController;
