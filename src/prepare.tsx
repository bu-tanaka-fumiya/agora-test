import React from "react";

const Prepare: React.FC = React.memo(() => {
  const [hostUIDs, setHostUIDs] = React.useState<string[]>([]);
  const [audienceUIDs, setAudienceUIDs] = React.useState<string[]>([]);
  const [channel, setChannel] = React.useState<string>("");

  const handleCreateUID = React.useCallback(
    (role: "host" | "audience") => () => {
      let uid = "";
      while (!uid || [...hostUIDs, ...audienceUIDs].includes(uid)) {
        uid = `${Math.floor(Math.random() * 1000000)}`;
      }
      if (role === "host") {
        setHostUIDs((uids) => [...uids, uid]);
      } else {
        setAudienceUIDs((uids) => [...uids, uid]);
      }
    },
    [hostUIDs, audienceUIDs]
  );

  React.useEffect(() => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 16;
    setChannel(
      Array.from(
        Array(length),
        (_) => chars[Math.floor(Math.random() * chars.length)]
      ).join("")
    );
  }, []);

  return channel ? (
    <div>
      <h1>{`準備画面（channel: ${channel}）`}</h1>
      <button onClick={handleCreateUID("host")}>配信者作成</button>
      <button onClick={handleCreateUID("audience")}>視聴者作成</button>
      {(["host", "audience"] as const).map((role) => (
        <div key={role}>
          <h2>{`${role === "host" ? "配信者" : "視聴者"}一覧`}</h2>
          {(role === "host" ? hostUIDs : audienceUIDs).map((uid, index) => (
            <p key={`${role}-${uid}`}>
              <a
                href={`${location.origin}${location.pathname}?channel=${channel}&role=${role}&uid=${uid}`}
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
  ) : null;
});

export default Prepare;
