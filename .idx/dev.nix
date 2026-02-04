{ pkgs, ... }: {
  channel = "stable-24.11"; 

  packages = [
    pkgs.nodejs_20
    pkgs.jdk17
  ];

  env = {
    EXPO_TOKEN = "z6K-hvkVcXQ6wj79iB96B-ICsaoIdZu-qIRabjnr"; 
  };

  idx = {
    extensions = [ "expo.vscode-expo-tools" ];

    previews = {
      enable = true;
      previews = {
        android = {
          command = ["npx" "expo" "start" "--android"];
          manager = "android";
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
