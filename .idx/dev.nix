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
        # Web preview for React Native app
        web = {
          command = ["npx" "expo" "start" "--web" "--port" "$PORT"];
          manager = "web";
        };
      };
    };

    workspace = {
      onCreate = {
        install = "bun install";
      };
      onStart = {
        start-expo = "npx expo start --web";
      };
    };
  };
}
