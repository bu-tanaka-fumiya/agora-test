import React from "react";
import useAgora from "./useAgora";
import AudioController from "./audioController";

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
      <h1>{`視聴者画面 (channel: ${channel}, uid: ${uid})`}</h1>
      {agora.isJoin ? (
        <>
          <h2>配信者一覧</h2>
          {agora.remoteAudioUsers.map((remoteAudioUser) => (
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
        <button onClick={() => agora.join()}>参加する</button>
      )}
    </div>
  );
});

export default Audience;
