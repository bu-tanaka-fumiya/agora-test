/*
  複数音声入力を1つのclientで配信する
*/

import React from "react";
import AgoraRTC, {
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  UID,
} from "agora-rtc-sdk-ng";

const useAgora = ({
  role,
  appId,
  channel,
  uid,
}: {
  role: "host" | "audience";
  appId: string;
  channel: string;
  uid: string;
}) => {
  // const [localVideos, setLocalVideos] = React.useState<
  //   { track: ICameraVideoTrack; deviceId: string; deviceName: string }[]
  // >([]);
  const [localAudios, setLocalAudios] = React.useState<
    {
      track: IMicrophoneAudioTrack;
      deviceId: string;
      deviceName: string;
      volume: number;
      setVolume: (volume: number) => void;
      muted: boolean;
      setMuted: (muted: boolean) => void;
    }[]
  >([]);

  const [isJoin, setIsJoin] = React.useState<boolean>(false);

  const [remoteUsers, setRemoteUsers] = React.useState<IAgoraRTCRemoteUser[]>(
    []
  );

  const [remoteAudioUsers, setRemoteAudioUsers] = React.useState<
    {
      track: IRemoteAudioTrack;
      uid: UID;
      volume: number;
      setVolume: (volume: number) => void;
      muted: boolean;
      setMuted: (muted: boolean, volume: number) => void;
    }[]
  >([]);

  const client = React.useMemo(
    () => AgoraRTC.createClient({ mode: "live", codec: "vp8", role }),
    [role]
  );

  const join = React.useCallback(
    async (devices?: MediaDeviceInfo[]) => {
      await client.join(appId, channel, null, uid);

      setIsJoin(true);

      if (role === "host" && devices) {
        const _localAudioTracks: IMicrophoneAudioTrack[] = [];
        // const _localVideoTracks: ICameraVideoTrack[] = [];
        for (const device of devices) {
          if (device.kind === "audioinput") {
            const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
            microphoneTrack.setDevice(device.deviceId);
            microphoneTrack.setMuted(false);
            const defaultVolume = 100;
            microphoneTrack.setVolume(defaultVolume);

            _localAudioTracks.push(microphoneTrack);
            setLocalAudios((prev) => [
              ...prev,
              {
                track: microphoneTrack,
                deviceId: device.deviceId,
                deviceName: device.label,
                volume: defaultVolume,
                setVolume: (volume: number) => {
                  microphoneTrack.setVolume(volume);
                  setLocalAudios((_prev) =>
                    _prev.map((_audio) =>
                      _audio.deviceId === device.deviceId
                        ? { ..._audio, volume }
                        : _audio
                    )
                  );
                },
                muted: microphoneTrack.muted,
                setMuted: (muted: boolean) => {
                  microphoneTrack.setMuted(muted);
                  setLocalAudios((_prev) =>
                    _prev.map((_audio) =>
                      _audio.deviceId === device.deviceId
                        ? { ..._audio, muted }
                        : _audio
                    )
                  );
                },
              },
            ]);
            // } else if (device.kind === "videoinput") {
            //   const cameraTrack = await AgoraRTC.createCameraVideoTrack();
            //   cameraTrack.setDevice(device.deviceId);
            //   cameraTrack.setMuted(false);
            //   cameraTrack.setEnabled(false);

            //   _localVideoTracks.push(cameraTrack);
            //   setLocalVideos((prev) => [
            //     ...prev,
            //     {
            //       track: cameraTrack,
            //       deviceId: device.deviceId,
            //       deviceName: device.label,
            //     },
            //   ]);
          }
        }

        // await client.publish([..._localAudioTracks, ..._localVideoTracks]);
        await client.publish([..._localAudioTracks]);
      }
    },
    [appId, channel, client, role, uid]
  );

  const leave = React.useCallback(async () => {
    localAudios.forEach(({ track }) => {
      track.stop();
      track.close();
    });
    // localVideos.forEach(({ track }) => {
    //   track.stop();
    //   track.close();
    // });
    setLocalAudios([]);
    // setLocalVideos([]);
    setRemoteUsers([]);
    setIsJoin(false);

    await client.leave();
  }, [client, localAudios]);

  React.useEffect(() => {
    const nextRemoteAudioUsers = [
      ...remoteAudioUsers.filter((remoteAudioUser) =>
        remoteUsers.find((remoteUser) => remoteAudioUser.uid === remoteUser.uid)
      ),
    ];
    setRemoteAudioUsers([
      ...remoteAudioUsers.filter((remoteAudioUser) =>
        remoteUsers.find((remoteUser) => remoteAudioUser.uid === remoteUser.uid)
      ),
    ]);
    remoteUsers.forEach((remoteUser) => {
      const audioTrack = remoteUser.audioTrack;
      if (
        audioTrack &&
        !remoteAudioUsers.find(
          (remoteAudioUser) => remoteAudioUser.uid === remoteUser.uid
        )
      ) {
        nextRemoteAudioUsers.push({
          track: audioTrack,
          uid: remoteUser.uid,
          volume: 100,
          setVolume: (volume: number) => {
            audioTrack.setVolume(volume);
            setRemoteAudioUsers((_prev) =>
              _prev.map((_remoteAudioUser) =>
                _remoteAudioUser.uid === remoteUser.uid
                  ? { ..._remoteAudioUser, volume }
                  : _remoteAudioUser
              )
            );
          },
          muted: false,
          setMuted: (muted: boolean, volume: number) => {
            audioTrack.setVolume(muted ? 0 : volume);
            setRemoteAudioUsers((_prev) =>
              _prev.map((_remoteAudioUser) =>
                _remoteAudioUser.uid === remoteUser.uid
                  ? { ..._remoteAudioUser, muted }
                  : _remoteAudioUser
              )
            );
          },
        });
      }
    });
    setRemoteAudioUsers(nextRemoteAudioUsers);
  }, [remoteUsers]);

  React.useEffect(() => {
    setRemoteUsers(client.remoteUsers);

    client.enableAudioVolumeIndicator();

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      console.log("event: UserPublished", user, mediaType);
      await client.subscribe(user, mediaType);

      setRemoteUsers(Array.from(client.remoteUsers));

      if (mediaType === "audio") {
        user.audioTrack?.setVolume(100);
        user.audioTrack?.play();
      }
    };
    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      console.log("event: UserUnpublished", user);
      setRemoteUsers(Array.from(client.remoteUsers));
    };
    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      console.log("event: UserJoined", user);
      setRemoteUsers(Array.from(client.remoteUsers));
    };
    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      console.log("event: UserLeft", user);
      setRemoteUsers(Array.from(client.remoteUsers));
    };
    const handleUserInfoUpdated = (uid: UID, msg: string) => {
      console.log("event: UserInfoUpdated", uid, msg);
    };
    const handleVolumeIndicator = (
      volumes: {
        level: number;
        uid: UID;
      }[]
    ) => {
      console.log("event: VolumeIndicator", volumes);
    };

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-joined", handleUserJoined);
    client.on("user-left", handleUserLeft);
    client.on("user-info-updated", handleUserInfoUpdated);
    client.on("volume-indicator", handleVolumeIndicator);

    return () => {
      client.off("user-published", handleUserPublished);
      client.off("user-unpublished", handleUserUnpublished);
      client.off("user-joined", handleUserJoined);
      client.off("user-left", handleUserLeft);
      client.off("user-info-updated", handleUserInfoUpdated);
      client.off("volume-indicator", handleVolumeIndicator);
    };
  }, [client, role]);

  return {
    localAudios,
    isJoin,
    leave,
    join,
    remoteAudioUsers,
  };
};

export default useAgora;
