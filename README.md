# Agora 調査

## デモ

## 調査内容

一つの端末で複数音声入力

## 調査結果

### 1. 単一配信者で複数音声入力ができるか

以下の手順で実現可能

```tsx
import AgoraRTC from "agora-rtc-sdk-ng";

const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });

// 複数の AudioTrack を用意（この例では2つ用意）
const audioTrack1 = await AgoraRTC.createMicrophoneAudioTrack();
const audioTrack2 = await AgoraRTC.createMicrophoneAudioTrack();

// 使用する音声入力デバイスの deviceID を設定（AgoraRTC.getDevices()で利用可能なデバイス一覧を取得し、その中から使用したい音声入力デバイスのIDを取得）
const audioDeviceId1 = "...";
const audioDeviceId2 = "...";

// 各 AudioTrack に audioDeviceId をセット
audioTrack1.setDevice(audioDeviceId1);
audioTrack2.setDevice(audioDeviceId2);

client.publish([audioTrack1, audioTrack2]);
```

### 2. 1.の場合、各音声入力のボリューム調整ができるか（ついでにミュート切り替えについても確認）

配信者側からは各音声入力に対してボリューム調整可能（setVolume）

ミュート切り替えも可能（setMuted）

```tsx
// audioTrackのボリューム調整
// volume: 0〜1000、100が元々のボリューム
audioTrack.setVolume(volume);

// audioTrackのミュート切り替え
// muted: boolean
audioTrack.setMuted(muted);
```

視聴者側からは配信者単位でのボリューム調整は可能（配信者が複数音声入力していても視聴者には判別できない）

配信者の audioTrack にはミュート切り替えメソッドはないが、ボリューム調整メソッドを代用することでミュート切り替えできる

```tsx
// 配信者単位でのボリューム調整
// volume: 0〜100、配信者の現在のボリュームの何%で聞くのか
remoteUser.audioTrack.setVolume(volume);

// 配信者単位でのミュート切り替え
remoteUser.audioTrack.setVolume(muted ? 0 : volume);
```
