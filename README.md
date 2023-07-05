# Agora 調査

## 調査内容・結果

### (1) 単一配信者で複数音声入力ができるか

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

### (2) (1)の場合、各音声入力の音量調整ができるか（ついでにミュート切り替えについても確認）

配信者側からは各音声入力に対して音量調整可能（`setVolume`）

ミュート切り替えも可能（`setMuted`）

```tsx
// audioTrackの音量調整
// volume: 0〜1000、100が元々の音量
audioTrack.setVolume(volume);

// audioTrackのミュート切り替え
// muted: ミュート状態かどうか
audioTrack.setMuted(muted);
```

視聴者側からは配信者単位での音量調整は可能（配信者が複数音声入力していても視聴者には判別できない）

リモートユーザーの audioTrack にはミュート切り替えメソッドはないが、音量調整メソッドを代用することでミュート切り替えできる

```tsx
// 配信者単位での音量調整
// volume: 0〜100、配信者の現在の音量の何%で聞くのか
remoteUser.audioTrack.setVolume(volume);

// 配信者単位でのミュート切り替え
remoteUser.audioTrack.setVolume(muted ? 0 : volume);
```

### (3) 相手側の音量のレベルを横に伸びるゲージで表現

音量レベルの取得には`getVolumeLevel`を使用

```tsx
// 配信者の音量レベル取得
// 範囲は0〜1、通常は音量レベルが0.6を超えるユーザーはアクティブスピーカーとなる
const volumeLevel = remoteUser.audioTrack.getVolumeLevel();
```

今回の[デモ](#デモ)では`setInterval`を使って、0.2 秒間隔で上記を取得している

※ ただし(2)を使ってリモートユーザーの音量調整（`setVolume`）をした際、音量レベルへの影響はないので、`getVolumeLevel`で取得した音量レベルと実際に聞いた音量レベルにはズレが生じる

実際の音量レベルを算出するとしたら、下記のような式になると考える（デモ上では「配信者側/視聴者側の音量レベル」として分けて表示しており、視聴者側については下記の数値で表示しています）

```tsx
// muted: ミュート状態かどうか
// volumeLevel：音量レベル（0〜1）
// volume: 現在の音量（0〜maxVolume）
// maxVolume: 最大音量
const remoteActualVolumeLevel =
  (Number(!muted) * volumeLevel * volume) / maxVolume;
```

### (4) 相手側の音量をスライダーで調整

(2)をもとに実装

## デモ

[準備画面](https://bu-tanaka-fumiya.github.io/agora-test/)で APP ID / channel を設定後、配信者/視聴者画面を作成

配信者画面で「複数音声入力を 1 つの client で配信する」を選択することで、単一配信者での複数音声入力についてのテストができる
