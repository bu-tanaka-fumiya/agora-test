import React from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import useAgora from "./useAgora";
import useAgora1 from "./useAgora1";
import AudioController from "./audioController";

type Props = {
  appId: string;
  channel: string;
  uid: string;
};

const Host: React.FC<Props> = React.memo(({ appId, channel, uid }) => {
  const agora = useAgora({
    appId,
    channel,
    role: "host",
    uid,
  });

  const agora1 = useAgora1({
    appId,
    channel,
    role: "host",
    uid,
  });

  const [mode, setMode] = React.useState<number>(0);

  const [audioInputDevices, setAudioInputDevices] = React.useState<
    MediaDeviceInfo[]
  >([]);
  const [selectedAudioInputDevices, setSelectedAudioInputDevices] =
    React.useState<MediaDeviceInfo[]>([]);

  const { isJoin, join, remoteAudioUsers, audios } = React.useMemo(() => {
    const { isJoin, join, remoteAudioUsers } = mode ? agora1 : agora;
    const audios = (mode ? agora1.list : agora.localAudios).map(
      ({ deviceId, deviceName, volume, setVolume, muted, setMuted }) => ({
        deviceId,
        deviceName,
        volume,
        setVolume,
        muted,
        setMuted,
      })
    );

    return { isJoin, join, remoteAudioUsers, audios };
  }, [agora, agora1, mode]);

  React.useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true });
    AgoraRTC.getDevices()
      .then((devices) => {
        console.log(devices.filter((d) => d.kind === "audioinput"));
        setAudioInputDevices(
          devices.filter(
            (d) => d.deviceId !== "default" && d.kind === "audioinput"
          )
        );
        setSelectedAudioInputDevices(
          devices
            .filter((d) => d.deviceId !== "default" && d.kind === "audioinput")
            .filter((_, index) => index === 0)
        );
      })
      .catch((e) => {
        console.log("get devices error!", e);
      });
  }, []);

  return (
    <div>
      <h1>{`配信者画面 (channel: ${channel}, uid: ${uid})`}</h1>
      {isJoin ? (
        <>
          <h2>使用中の音声入力デバイス一覧</h2>
          {audios.map((audio, index) => {
            return (
              <AudioController
                key={index}
                label={audio.deviceName}
                volume={audio.volume}
                maxVolume={1000}
                setVolume={audio.setVolume}
                muted={audio.muted}
                setMuted={audio.setMuted}
              />
            );
          })}
          <h2>他の配信者一覧</h2>
          {remoteAudioUsers.map((remoteAudioUser) => (
            <AudioController
              key={remoteAudioUser.uid}
              label={`${remoteAudioUser.uid}`}
              volume={remoteAudioUser.volume}
              maxVolume={100}
              setVolume={remoteAudioUser.setVolume}
              muted={remoteAudioUser.muted}
              setMuted={(muted) =>
                remoteAudioUser.setMuted(muted, remoteAudioUser.volume)
              }
            />
          ))}
        </>
      ) : (
        <>
          <h2>配信手法</h2>
          <div>
            {[
              { label: "複数音声入力を1つのclientで配信する", value: 0 },
              { label: "各音声入力につき1つのclientで配信する", value: 1 },
            ].map(({ label, value }, index) => (
              <p key={index}>
                <input
                  type="radio"
                  value={value}
                  checked={mode === value}
                  onChange={() => setMode(value)}
                />
                <span>{label}</span>
              </p>
            ))}
          </div>
          <h2>音声入力デバイス</h2>
          {audioInputDevices.map((audioInputDevice) => (
            <p key={audioInputDevice.deviceId}>
              <input
                type="checkbox"
                checked={
                  !!selectedAudioInputDevices.find(
                    (selectedAudioInputDevice) =>
                      selectedAudioInputDevice.deviceId ===
                      audioInputDevice.deviceId
                  )
                }
                onChange={(event) => {
                  setSelectedAudioInputDevices((prevDevices) =>
                    audioInputDevices.filter((_audioInputDevice) =>
                      _audioInputDevice.deviceId === audioInputDevice.deviceId
                        ? event.target.checked
                        : prevDevices.find(
                            (prevDevice) =>
                              prevDevice.deviceId === _audioInputDevice.deviceId
                          )
                    )
                  );
                }}
              />
              <span>{audioInputDevice.label}</span>
            </p>
          ))}
          <button
            onClick={() => join(selectedAudioInputDevices)}
            disabled={selectedAudioInputDevices.length === 0}
          >
            配信する
          </button>
        </>
      )}
    </div>
  );
});

export default Host;
