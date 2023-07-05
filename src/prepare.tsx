import React from "react";

type Props = {
  appId: string;
  channel: string;
};

const getRandomChannel = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 16;
  return Array.from(
    Array(length),
    (_) => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const Prepare: React.FC<Props> = React.memo(({ appId, channel }) => {
  const [hostUIDs, setHostUIDs] = React.useState<string[]>([]);
  const [audienceUIDs, setAudienceUIDs] = React.useState<string[]>([]);
  const [state, setState] = React.useState<{ appId: string; channel: string }>({
    appId: "",
    channel: "",
  });

  const handleCreateUID = React.useCallback(
    (role: "host" | "audience") => () => {
      let uid = "";
      while (!uid || [...hostUIDs, ...audienceUIDs].includes(uid)) {
        uid = `${Math.floor(Math.random() * 4294967295)}`;
      }
      if (role === "host") {
        setHostUIDs((uids) => [...uids, uid]);
      } else {
        setAudienceUIDs((uids) => [...uids, uid]);
      }
    },
    [hostUIDs, audienceUIDs]
  );

  const handleCreateRandomChannel = React.useCallback(() => {
    setState((state) => ({
      ...state,
      channel: getRandomChannel(),
    }));
  }, []);

  React.useEffect(() => {
    if (appId && !channel) {
      location.replace(
        `${location.origin}${
          location.pathname
        }?appId=${appId}&channel=${getRandomChannel()}`
      );
    }
  }, []);

  return appId ? (
    channel ? (
      <div>
        <h1>{`準備画面（appId: ${appId}, channel: ${channel}）`}</h1>
        <button onClick={handleCreateUID("host")}>配信者追加</button>
        <button onClick={handleCreateUID("audience")}>視聴者追加</button>
        {(["host", "audience"] as const).map((role) => (
          <div key={role}>
            <h2>{`${role === "host" ? "配信者" : "視聴者"}一覧`}</h2>
            {(role === "host" ? hostUIDs : audienceUIDs).map((uid, index) => (
              <p key={`${role}-${uid}`}>
                <a
                  href={`${location.origin}${location.pathname}?appId=${appId}&channel=${channel}&role=${role}&uid=${uid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >{`${role === "host" ? "配信者" : "視聴者"}${
                  index + 1
                } (uid: ${uid})`}</a>
              </p>
            ))}
          </div>
        ))}
      </div>
    ) : null
  ) : (
    <div>
      <h1>{`準備画面`}</h1>
      <div>
        <h2>APP ID</h2>
        <input
          value={state.appId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setState((state) => ({ ...state, appId: e.target.value }))
          }
        />
      </div>
      <div>
        <h2>channel</h2>
        <input
          value={state.channel}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (
              /^[a-zA-Z0-9 !#$%&()+\-:;<=>?@[\]^_{|}~,."]{0,64}$/.test(
                e.target.value
              )
            ) {
              setState((state) => ({ ...state, channel: e.target.value }));
            }
          }}
        />
        <button onClick={() => handleCreateRandomChannel()}>
          ランダム作成
        </button>
      </div>
      <button
        disabled={!state.appId || !state.channel}
        onClick={() =>
          location.replace(
            `${location.origin}${location.pathname}?appId=${state.appId}&channel=${state.channel}`
          )
        }
      >
        設定
      </button>
    </div>
  );
});

export default Prepare;
