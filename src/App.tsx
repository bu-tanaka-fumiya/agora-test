import React from "react";
import Host from "./host";
import Audience from "./audience";
import Prepare from "./prepare";

const appId = "6cc8b28e68db4013be54c0b24df29386";

const App = React.memo(() => {
  const { role, uid, channel } = React.useMemo(() => {
    let channel = "";
    let role = "";
    let uid = "";
    window.location.search
      .replace("?", "")
      .split("&")
      .forEach((searchStr) => {
        if (/channel=/.test(searchStr)) {
          channel = searchStr.replace("channel=", "");
        } else if (/role=(host|audience)/.test(searchStr)) {
          role = searchStr.replace("role=", "");
        } else if (/uid=/.test(searchStr)) {
          uid = searchStr.replace("uid=", "");
        }
      });

    return { role, uid, channel };
  }, []);

  return role && channel ? (
    role === "host" ? (
      <Host {...{ appId, channel, uid }} />
    ) : role === "audience" ? (
      <Audience {...{ appId, channel, uid }} />
    ) : null
  ) : (
    <Prepare />
  );
});

export default App;
