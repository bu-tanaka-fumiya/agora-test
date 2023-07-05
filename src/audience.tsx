import React from "react";
import useAgora from "./useAgora";
import VolumeController from "./volumeController";

type Props = {
  appId: string;
  channel: string;
  uid: string;
};

const Audience: React.FC<Props> = React.memo(({ appId, channel, uid }) => {
  const agora = useAgora({
    appId,
    channel,
    role: "audience",
    uid,
  });

  return (
    <div>
      <h1>{`視聴者画面 (appId: ${appId}, channel: ${channel}, uid: ${uid})`}</h1>
      {agora.isJoin ? (
        <>
          <h2>配信者一覧</h2>
          {agora.remoteAudioUsers.map((remoteAudioUser) => (
            <VolumeController
              key={remoteAudioUser.uid}
              type="remote"
              label={`${remoteAudioUser.uid}`}
              volume={remoteAudioUser.volume}
              maxVolume={100}
              setVolume={remoteAudioUser.setVolume}
              muted={remoteAudioUser.muted}
              setMuted={(muted) =>
                remoteAudioUser.setMuted(muted, remoteAudioUser.volume)
              }
              volumeLevel={remoteAudioUser.volumeLevel}
            />
          ))}
        </>
      ) : (
        <button onClick={() => agora.join()}>参加する</button>
      )}
    </div>
  );
});

export default Audience;
