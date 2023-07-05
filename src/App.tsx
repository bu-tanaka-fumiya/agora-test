import React from "react";
import Host from "./host";
import Audience from "./audience";
import Prepare from "./prepare";

const App = React.memo(() => {
  const { appId, channel, role, uid } = React.useMemo(() => {
    let appId = "";
    let channel = "";
    let role = "";
    let uid = "";
    window.location.search
      .replace("?", "")
      .split("&")
      .forEach((searchStr) => {
        if (/appId=/.test(searchStr)) {
          appId = searchStr.replace("appId=", "");
        } else if (/channel=/.test(searchStr)) {
          channel = searchStr.replace("channel=", "");
        } else if (/role=(host|audience)/.test(searchStr)) {
          role = searchStr.replace("role=", "");
        } else if (/uid=/.test(searchStr)) {
          uid = searchStr.replace("uid=", "");
        }
      });

    return { appId, channel, role, uid };
  }, []);

  return appId && channel && role && uid ? (
    role === "host" ? (
      <Host {...{ appId, channel, uid }} />
    ) : role === "audience" ? (
      <Audience {...{ appId, channel, uid }} />
    ) : null
  ) : (
    <Prepare {...{ appId, channel }} />
  );
});

export default App;
