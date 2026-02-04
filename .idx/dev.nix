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
        web = {
          command = ["npx" "expo" "start" "--web"];
          manager = "web";
        };
      };
    };

    workspace = {
      onCreate = {
        install = "npm install";
      };
    };
  };
}
