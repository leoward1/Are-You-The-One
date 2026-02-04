{ pkgs, ... }: {
  channel = "stable-24.11"; 

  packages = [
    pkgs.nodejs_20
    pkgs.bun
  ];

  env = {
    EXPO_TOKEN = "z6K-hvkVcXQ6wj79iB96B-ICsaoIdZu-qIRabjnr"; 
  };

  idx = {
    extensions = [ "expo.vscode-expo-tools" ];

    previews = {
      enable = true;
      previews = {
        # This triggers the browser-based iOS simulator
        ios = {
          command = ["npx" "expo" "start" "--ios" "--port" "$PORT" "--host" "localhost"];
          manager = "ios";
        };
      };
    };

    workspace = {
      onCreate = {
        install = "bun install";
      };
      # This ensures the app starts as soon as you open the workspace
      onStart = {
        start-expo = "npx expo start --ios";
      };
    };
  };
}
