/*
  各音声入力につき1つのclientで配信する
*/

import React from "react";
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  UID,
} from "agora-rtc-sdk-ng";

const useAgora1 = ({
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
  const [isJoin, setIsJoin] = React.useState<boolean>(false);

  const [remoteUsers, setRemoteUsers] = React.useState<IAgoraRTCRemoteUser[]>(
    []
  );

  const [list, setList] = React.useState<
    {
      client: IAgoraRTCClient;
      track: IMicrophoneAudioTrack;
      deviceId: string;
      deviceName: string;
      volume: number;
      setVolume: (volume: number) => void;
      muted: boolean;
      setMuted: (muted: boolean) => void;
    }[]
  >([]);

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

  const join = React.useCallback(
    async (devices: MediaDeviceInfo[]) => {
      for (const device of devices) {
        const client = AgoraRTC.createClient({
          mode: "live",
          codec: "vp8",
          role,
        });

        await client.join(appId, channel, null, `${uid}-${device.deviceId}`);
        if (device.kind === "audioinput") {
          const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
          microphoneTrack.setDevice(device.deviceId);
          microphoneTrack.setMuted(false);
          const defaultVolume = 100;
          microphoneTrack.setVolume(defaultVolume);

          await client.publish(microphoneTrack);

          setList((prev) => [
            ...prev,
            {
              client,
              track: microphoneTrack,
              deviceId: device.deviceId,
              deviceName: device.label,
              volume: defaultVolume,
              setVolume: (volume: number) => {
                microphoneTrack.setVolume(volume);
                setList((_prev) =>
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
                setList((_prev) =>
                  _prev.map((_audio) =>
                    _audio.deviceId === device.deviceId
                      ? { ..._audio, muted }
                      : _audio
                  )
                );
              },
            },
          ]);
        }
      }

      setIsJoin(true);
    },
    [appId, channel, role, uid]
  );

  const leave = React.useCallback(async () => {
    for (const { client, track } of list) {
      track.stop();
      track.close();

      await client.leave();
    }
    setList([]);
    setRemoteUsers([]);
    setIsJoin(false);
  }, [list]);

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
    const client = list[0]?.client;

    if (!client) {
      return;
    }

    setRemoteUsers(client.remoteUsers);

    client.enableAudioVolumeIndicator();

    const isMyClient = (uid: UID) =>
      list.find((item) => item.client.uid === uid);

    const handleUserPublished = async (
      user: IAgoraRTCRemoteUser,
      mediaType: "audio" | "video"
    ) => {
      if (isMyClient(user.uid)) {
        return;
      }

      console.log("event: UserPublished", user, mediaType);
      await client.subscribe(user, mediaType);

      setRemoteUsers(Array.from(client.remoteUsers));

      if (mediaType === "audio") {
        user.audioTrack?.setVolume(100);
        user.audioTrack?.play();
      }
    };
    const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
      if (isMyClient(user.uid)) {
        return;
      }
      console.log("event: UserUnpublished", user);
      setRemoteUsers(Array.from(client.remoteUsers));
    };
    const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
      if (isMyClient(user.uid)) {
        return;
      }
      console.log("event: UserJoined", user);
      setRemoteUsers(Array.from(client.remoteUsers));
    };
    const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
      if (isMyClient(user.uid)) {
        return;
      }
      console.log("event: UserLeft", user);
      setRemoteUsers(Array.from(client.remoteUsers));
    };
    const handleUserInfoUpdated = (uid: UID, msg: string) => {
      if (isMyClient(uid)) {
        return;
      }
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
    // }
  }, [list, role]);

  return {
    list,
    isJoin,
    leave,
    join,
    remoteAudioUsers,
  };
};

export default useAgora1;
