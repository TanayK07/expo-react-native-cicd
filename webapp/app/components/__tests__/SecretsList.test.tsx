import React from "react";
import { render, screen } from "@testing-library/react";
import SecretsList from "../SecretsList";
import { AdvancedOptions } from "../../types";

const defaultOptions: AdvancedOptions = {
  iOSSupport: false,
  publishToExpo: false,
  publishToStores: false,
  jestTests: false,
  rntlTests: false,
  renderHookTests: false,
  caching: true,
  notifications: false,
};

describe("SecretsList — always shows EXPO_TOKEN", () => {
  it("always shows EXPO_TOKEN regardless of storage type", () => {
    render(<SecretsList storageType="github-release" advancedOptions={null} />);
    expect(screen.getByText("EXPO_TOKEN")).toBeInTheDocument();
  });

  it("shows EXPO_TOKEN with github-release storage", () => {
    render(
      <SecretsList
        storageType="github-release"
        advancedOptions={defaultOptions}
      />,
    );
    expect(screen.getByText("EXPO_TOKEN")).toBeInTheDocument();
  });
});

describe("SecretsList — storage-specific secrets", () => {
  it("shows Zoho Drive secrets for zoho-drive storage", () => {
    render(
      <SecretsList storageType="zoho-drive" advancedOptions={defaultOptions} />,
    );
    expect(
      screen.getByText("RCLONE_CONFIG_ZOHODRIVE_TYPE"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("RCLONE_CONFIG_ZOHODRIVE_TOKEN"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("RCLONE_CONFIG_ZOHODRIVE_DRIVE_ID"),
    ).toBeInTheDocument();
  });

  it("does NOT show Zoho secrets for github-release storage", () => {
    render(
      <SecretsList
        storageType="github-release"
        advancedOptions={defaultOptions}
      />,
    );
    expect(
      screen.queryByText("RCLONE_CONFIG_ZOHODRIVE_TYPE"),
    ).not.toBeInTheDocument();
  });

  it("shows Google Drive secrets for google-drive storage", () => {
    render(
      <SecretsList
        storageType="google-drive"
        advancedOptions={defaultOptions}
      />,
    );
    expect(screen.getByText("RCLONE_CONFIG_GDRIVE_TYPE")).toBeInTheDocument();
    expect(screen.getByText("RCLONE_CONFIG_GDRIVE_TOKEN")).toBeInTheDocument();
    expect(
      screen.getByText("RCLONE_CONFIG_GDRIVE_ROOT_FOLDER_ID"),
    ).toBeInTheDocument();
  });

  it("does NOT show Google Drive secrets for zoho-drive storage", () => {
    render(
      <SecretsList storageType="zoho-drive" advancedOptions={defaultOptions} />,
    );
    expect(
      screen.queryByText("RCLONE_CONFIG_GDRIVE_TYPE"),
    ).not.toBeInTheDocument();
  });

  it("shows custom cloud storage secrets for custom storage", () => {
    render(
      <SecretsList storageType="custom" advancedOptions={defaultOptions} />,
    );
    expect(screen.getByText("CLOUD_STORAGE_TYPE")).toBeInTheDocument();
    expect(screen.getByText("CLOUD_STORAGE_TOKEN")).toBeInTheDocument();
    expect(screen.getByText("CLOUD_STORAGE_ROOT_ID")).toBeInTheDocument();
  });

  it("does NOT show custom secrets for github-release storage", () => {
    render(
      <SecretsList
        storageType="github-release"
        advancedOptions={defaultOptions}
      />,
    );
    expect(screen.queryByText("CLOUD_STORAGE_TYPE")).not.toBeInTheDocument();
  });
});

describe("SecretsList — iOS secrets", () => {
  it("shows Apple secrets when iOSSupport is true", () => {
    render(
      <SecretsList
        storageType="github-release"
        advancedOptions={{ ...defaultOptions, iOSSupport: true }}
      />,
    );
    expect(screen.getByText("EXPO_APPLE_ID")).toBeInTheDocument();
    expect(screen.getByText("EXPO_APPLE_PASSWORD")).toBeInTheDocument();
    expect(screen.getByText("EXPO_TEAM_ID")).toBeInTheDocument();
  });

  it("does NOT show Apple secrets when iOSSupport is false", () => {
    render(
      <SecretsList
        storageType="github-release"
        advancedOptions={{ ...defaultOptions, iOSSupport: false }}
      />,
    );
    expect(screen.queryByText("EXPO_APPLE_ID")).not.toBeInTheDocument();
  });
});

describe("SecretsList — store publishing secrets", () => {
  it("shows GOOGLE_PLAY_SERVICE_ACCOUNT when publishToStores is true", () => {
    render(
      <SecretsList
        storageType="github-release"
        advancedOptions={{ ...defaultOptions, publishToStores: true }}
      />,
    );
    expect(screen.getByText("GOOGLE_PLAY_SERVICE_ACCOUNT")).toBeInTheDocument();
  });

  it("does NOT show GOOGLE_PLAY_SERVICE_ACCOUNT when publishToStores is false", () => {
    render(
      <SecretsList
        storageType="github-release"
        advancedOptions={{ ...defaultOptions, publishToStores: false }}
      />,
    );
    expect(
      screen.queryByText("GOOGLE_PLAY_SERVICE_ACCOUNT"),
    ).not.toBeInTheDocument();
  });
});

describe("SecretsList — notification secrets", () => {
  it("shows Slack and Discord webhook secrets when notifications is true", () => {
    render(
      <SecretsList
        storageType="github-release"
        advancedOptions={{ ...defaultOptions, notifications: true }}
      />,
    );
    expect(screen.getByText("SLACK_WEBHOOK")).toBeInTheDocument();
    expect(screen.getByText("DISCORD_WEBHOOK")).toBeInTheDocument();
  });

  it("does NOT show webhook secrets when notifications is false", () => {
    render(
      <SecretsList
        storageType="github-release"
        advancedOptions={{ ...defaultOptions, notifications: false }}
      />,
    );
    expect(screen.queryByText("SLACK_WEBHOOK")).not.toBeInTheDocument();
    expect(screen.queryByText("DISCORD_WEBHOOK")).not.toBeInTheDocument();
  });
});

describe("SecretsList — null advancedOptions (defaults)", () => {
  it("renders without error when advancedOptions is null", () => {
    expect(() =>
      render(
        <SecretsList storageType="github-release" advancedOptions={null} />,
      ),
    ).not.toThrow();
  });

  it("does NOT show iOS secrets when advancedOptions is null (iOSSupport defaults to false)", () => {
    render(<SecretsList storageType="github-release" advancedOptions={null} />);
    expect(screen.queryByText("EXPO_APPLE_ID")).not.toBeInTheDocument();
  });
});
